import { cookies } from 'next/headers'

export async function getFirstRender() {
  const cookiesStore = await cookies()
  const isFirstRender = cookiesStore.get('isFirstRender')?.value === 'true'

  return isFirstRender
}
