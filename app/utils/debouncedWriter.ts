export const STORAGE_WRITE_DELAY = 400

export interface DebouncedWriter<T> {
  schedule(value: T): void
  flush(): void
  cancel(): void
}

interface DebouncedWriterOptions<T> {
  write: (value: T) => void
  snapshot: (value: T) => T
  delay?: number
}

export function createDebouncedWriter<T>(options: DebouncedWriterOptions<T>): DebouncedWriter<T> {
  const delay = options.delay ?? STORAGE_WRITE_DELAY
  let timeout: ReturnType<typeof setTimeout> | undefined
  let pending: { value: T } | null = null

  function cancel(): void {
    if (timeout !== undefined) {
      clearTimeout(timeout)
      timeout = undefined
    }

    pending = null
  }

  function flush(): void {
    const scheduled = pending
    cancel()

    if (scheduled) {
      options.write(scheduled.value)
    }
  }

  function schedule(value: T): void {
    pending = { value: options.snapshot(value) }

    if (timeout !== undefined) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(flush, delay)
  }

  return { schedule, flush, cancel }
}
