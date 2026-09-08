import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedWriter } from '../../app/utils/debouncedWriter'

interface Payload {
  title: string
}

function createWriter(written: Payload[]) {
  return createDebouncedWriter<Payload>({
    write: (payload) => written.push(payload),
    snapshot: (payload) => ({ ...payload }),
    delay: 400
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('debounced writer', () => {
  it('writes once after the delay and keeps only the latest value', () => {
    const written: Payload[] = []
    const writer = createWriter(written)

    writer.schedule({ title: 'Первый' })
    vi.advanceTimersByTime(200)
    writer.schedule({ title: 'Последний' })
    vi.advanceTimersByTime(399)

    expect(written).toEqual([])

    vi.advanceTimersByTime(1)

    expect(written).toEqual([{ title: 'Последний' }])
  })

  it('flushes a pending value immediately and drops the timer', () => {
    const written: Payload[] = []
    const writer = createWriter(written)

    writer.schedule({ title: 'Заметка' })
    writer.flush()

    expect(written).toEqual([{ title: 'Заметка' }])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('does nothing when flushing without a pending value', () => {
    const written: Payload[] = []
    const writer = createWriter(written)

    writer.flush()

    expect(written).toEqual([])
  })

  it('cancels a pending write', () => {
    const written: Payload[] = []
    const writer = createWriter(written)

    writer.schedule({ title: 'Заметка' })
    writer.cancel()
    vi.runAllTimers()

    expect(written).toEqual([])
  })

  it('snapshots the value so later mutations do not leak into the write', () => {
    const written: Payload[] = []
    const writer = createWriter(written)
    const payload = { title: 'Заметка' }

    writer.schedule(payload)
    payload.title = 'Изменено после schedule'
    vi.runAllTimers()

    expect(written).toEqual([{ title: 'Заметка' }])
  })
})
