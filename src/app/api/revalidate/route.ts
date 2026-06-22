import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

/**
 * Sanity → Next.js on-demand revalidation webhook.
 *
 * Pair the ISR (hourly `revalidate`) safety net with instant purges: a GROQ
 * webhook in the Sanity dashboard POSTs here on every content change, and we
 * purge the matching cache tag so edits go live immediately instead of within
 * the hour.
 *
 * SANITY DASHBOARD SETUP (manage.sanity.io → API → Webhooks):
 *   • URL:        https://<your-domain>/api/revalidate
 *   • Trigger on: Create, Update, Delete
 *   • Filter:     _type in ["projects", "clientsView", "clients"]
 *   • Projection: {_type, "slug": slug.current}   ← MUST include _type
 *   • HTTP method: POST   ·   API version: v2021-03-25 (or later)
 *   • Secret:     same value as SANITY_REVALIDATE_SECRET in the env (.env + Vercel)
 *
 * The tags purged here must match the `next.tags` set on each client.fetch
 * (see src/services/*.service.ts): 'projects', 'clientsView', 'clients'.
 */

type WebhookPayload = {
  _type?: string
  slug?: string
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET

  // Fail closed: a missing server secret is a misconfiguration, not an auth error.
  if (!secret) {
    return new NextResponse('SANITY_REVALIDATE_SECRET is not configured', { status: 500 })
  }

  try {
    // `true` waits for Content Lake eventual consistency, so the revalidated
    // re-fetch reads the NEW document, not a stale one.
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad request: payload is missing `_type` (check the webhook projection)', {
        status: 400,
      })
    }

    // _type is now authenticated input — purge the cache tag it owns.
    // Next 16 requires the 2nd profile arg; 'max' is the documented migration
    // for the classic tag purge (updateTag() is Server-Action-only and throws
    // in a route handler). Invalidates the tagged fetches for the next request.
    revalidateTag(body._type, 'max')

    return NextResponse.json({
      revalidated: true,
      tag: body._type,
      slug: body.slug ?? null,
    })
  } catch (err) {
    console.error('[sanity-revalidate] webhook error:', err)
    return new NextResponse((err as Error).message, { status: 500 })
  }
}
