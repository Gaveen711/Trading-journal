const DEFAULT_GET_ALL_CHUNK_SIZE = 1000

/**
 * Firestore Admin getAll has a practical argument limit. Keep high-volume reads
 * bounded while still allowing each chunk to run in parallel.
 */
export async function chunkedDbGetAll(db: any, refs: any[], chunkSize = DEFAULT_GET_ALL_CHUNK_SIZE): Promise<any[]> {
  if (refs.length === 0) return []

  const promises = []
  for (let i = 0; i < refs.length; i += chunkSize) {
    promises.push(db.getAll(...refs.slice(i, i + chunkSize)))
  }

  return (await Promise.all(promises)).flat()
}

/**
 * Runs asynchronous work with a bounded number of active tasks.
 */
export async function runWithConcurrencyLimit<T>(
  limit: number,
  items: T[],
  fn: (item: T) => Promise<any>
): Promise<any[]> {
  const executing = new Set<Promise<any>>()
  const promises = []

  for (const item of items) {
    const promise = Promise.resolve().then(() => fn(item))
    promises.push(promise)
    executing.add(promise)

    const clean = () => executing.delete(promise)
    promise.then(clean, clean)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(promises)
}
