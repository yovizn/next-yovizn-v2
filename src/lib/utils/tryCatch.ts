/**
 * Type representing a successful result with data and no error
 */
type Success<T> = [data: T, error: null]

/**
 * Type representing a failed result with no data and an error
 */
type Failure<E> = [data: null, error: E]

/**
 * Union type representing either a successful or failed result
 */
type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * A utility function that wraps a promise execution in a try-catch block and returns a tuple result
 * 
 * @param promise - The promise to be executed
 * @returns A tuple containing either [data, null] on success or [null, error] on failure
 * 
 * @example
 * ```ts
 * const [data, error] = await tryCatch(somePromise())
 * 
 * if (error) {
 *   // Handle error case
 *   console.error(error)
 * } else {
 *   // Handle success case
 *   console.log(data)
 * }
 * ```
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return [data, null]
  } catch (error) {
    return [null, error as E]
  }
}
