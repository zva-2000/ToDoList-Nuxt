import type { StorageLike } from '../../app/utils/storage'

export function createMemoryStorage(entries: Record<string, string> = {}): StorageLike {
  const values = new Map(Object.entries(entries))

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    }
  }
}
