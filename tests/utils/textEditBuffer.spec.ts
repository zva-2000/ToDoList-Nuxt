import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTextEditBuffer } from '../../app/utils/textEditBuffer'

const DELAY = 500

interface RecordedEdit {
  previous: string
  next: string
}

function createRecorder(recorded: RecordedEdit[]) {
  return (previous: string, next: string) => {
    recorded.push({ previous, next })
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('text edit buffer', () => {
  it('collects consecutive typing into a single edit', () => {
    const recorded: RecordedEdit[] = []
    const record = createRecorder(recorded)
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', '', 'П', record)
    buffer.track('title', 'П', 'Пл', record)
    buffer.track('title', 'Пл', 'План', record)
    vi.advanceTimersByTime(DELAY)

    expect(recorded).toEqual([{ previous: '', next: 'План' }])
  })

  it('restarts the pause on every keystroke', () => {
    const recorded: RecordedEdit[] = []
    const record = createRecorder(recorded)
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', '', 'П', record)
    vi.advanceTimersByTime(DELAY - 1)
    buffer.track('title', 'П', 'Пл', record)
    vi.advanceTimersByTime(DELAY - 1)

    expect(recorded).toEqual([])

    vi.advanceTimersByTime(1)

    expect(recorded).toEqual([{ previous: '', next: 'Пл' }])
  })

  it('commits the previous field when another one starts changing', () => {
    const recorded: RecordedEdit[] = []
    const record = createRecorder(recorded)
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', '', 'План', record)
    buffer.track('todo:1', 'Задача', 'Задача 1', record)

    expect(recorded).toEqual([{ previous: '', next: 'План' }])

    vi.advanceTimersByTime(DELAY)

    expect(recorded).toEqual([
      { previous: '', next: 'План' },
      { previous: 'Задача', next: 'Задача 1' }
    ])
  })

  it('commits on demand, for example on blur', () => {
    const recorded: RecordedEdit[] = []
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', '', 'План', createRecorder(recorded))
    buffer.commit()

    expect(recorded).toEqual([{ previous: '', next: 'План' }])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores an edit that ends up with the original value', () => {
    const recorded: RecordedEdit[] = []
    const record = createRecorder(recorded)
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', 'План', 'Пла', record)
    buffer.track('title', 'Пла', 'План', record)
    buffer.commit()

    expect(recorded).toEqual([])
  })

  it('drops a pending edit when discarded', () => {
    const recorded: RecordedEdit[] = []
    const buffer = createTextEditBuffer(DELAY)

    buffer.track('title', '', 'План', createRecorder(recorded))
    buffer.discard()
    vi.runAllTimers()

    expect(recorded).toEqual([])
  })
})
