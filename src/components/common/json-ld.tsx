/**
 * Server component that renders a JSON-LD <script>.
 * XSS-safe: escapes `<` so a string value can never break out of the script tag.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\u003c'),
      }}
    />
  )
}
