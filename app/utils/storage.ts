export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function readItem(storage: StorageLike, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function writeItem(storage: StorageLike, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    return
  }
}

export function removeItem(storage: StorageLike, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    return
  }
}
