export interface ResponseData<T> {
  message: string
  result: T | null
  status: number
}
