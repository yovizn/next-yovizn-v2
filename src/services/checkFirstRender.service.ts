import { ResponseData } from '@/types/response.type'

export async function checkFirstRender() {
  const res = await fetch('/api/first-render')
  const data = (await res.json()) as ResponseData<boolean>
  return data
}
