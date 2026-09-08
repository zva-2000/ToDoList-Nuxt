import { describe, expect, it } from 'vitest'
import { getHistoryShortcut } from '../../app/utils/historyShortcut'

function createEvent(overrides: Partial<{
  altKey: boolean
  code: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}> = {}) {
  return {
    altKey: false,
    code: 'KeyZ',
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...overrides
  }
}

describe('history shortcut', () => {
  it('maps Ctrl+Z and Cmd+Z to undo even when the key character is not Latin z', () => {
    expect(getHistoryShortcut(createEvent({ ctrlKey: true }))).toBe('undo')
    expect(getHistoryShortcut(createEvent({ metaKey: true }))).toBe('undo')
  })

  it('maps Ctrl+Shift+Z to redo', () => {
    expect(getHistoryShortcut(createEvent({ ctrlKey: true, shiftKey: true }))).toBe('redo')
  })

  it('ignores unrelated combinations', () => {
    expect(getHistoryShortcut(createEvent({ ctrlKey: true, code: 'KeyY' }))).toBeNull()
    expect(getHistoryShortcut(createEvent({ ctrlKey: true, altKey: true }))).toBeNull()
    expect(getHistoryShortcut(createEvent())).toBeNull()
  })
})
