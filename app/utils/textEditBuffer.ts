export type TextEditRecorder = (previous: string, next: string) => void

export interface TextEditBuffer {
  track(key: string, previous: string, next: string, record: TextEditRecorder): void
  commit(): void
  discard(): void
}

interface PendingEdit {
  key: string
  previous: string
  next: string
  record: TextEditRecorder
  timeout: ReturnType<typeof setTimeout>
}

export function createTextEditBuffer(delay: number): TextEditBuffer {
  let pending: PendingEdit | null = null

  function discard(): void {
    if (pending) {
      clearTimeout(pending.timeout)
      pending = null
    }
  }

  function commit(): void {
    const edit = pending
    discard()

    if (edit && edit.previous !== edit.next) {
      edit.record(edit.previous, edit.next)
    }
  }

  function track(key: string, previous: string, next: string, record: TextEditRecorder): void {
    if (pending && pending.key !== key) {
      commit()
    }

    if (pending) {
      clearTimeout(pending.timeout)
      pending.next = next
      pending.timeout = setTimeout(commit, delay)
      return
    }

    pending = {
      key,
      previous,
      next,
      record,
      timeout: setTimeout(commit, delay)
    }
  }

  return { track, commit, discard }
}
