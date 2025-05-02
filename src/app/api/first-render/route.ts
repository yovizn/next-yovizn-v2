import { ResponseData } from '@/types/response.type'
import { cookies } from 'next/headers'

export async function GET() {
  const cookiesStore = await cookies()
  const isFirstRender = cookiesStore.get('isFirstRender')?.value === 'true'

  if (!isFirstRender) {
    cookiesStore.set({
      name: 'isFirstRender',
      value: 'true',
      maxAge: 60 * 10,
    })
  }

  const response: ResponseData<boolean> = {
    message: 'First render',
    result: isFirstRender,
    status: 200,
  }

  return Response.json(response)
}
