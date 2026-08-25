import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CvcStreamScrollState, SCROLL_SETTLE_MS } from './stream-scroll-state'

describe('CvcStreamScrollState', () => {
  let state: CvcStreamScrollState

  beforeEach(() => {
    vi.useFakeTimers()
    TestBed.configureTestingModule({ providers: [CvcStreamScrollState] })
    state = TestBed.inject(CvcStreamScrollState)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts settled at the top', () => {
    expect(state.isScrolling()).toBe(false)
    expect(state.isAtTop()).toBe(true)
    expect(state.isAtBottom()).toBe(true)
  })

  it('scrolls, then settles after the settle window', () => {
    state.reportScroll(100, 1000, 400)
    expect(state.isScrolling()).toBe(true)

    vi.advanceTimersByTime(SCROLL_SETTLE_MS - 1)
    expect(state.isScrolling()).toBe(true)

    vi.advanceTimersByTime(1)
    expect(state.isScrolling()).toBe(false)
  })

  it('extends the settle window while events keep arriving', () => {
    state.reportScroll(100, 1000, 400)
    vi.advanceTimersByTime(SCROLL_SETTLE_MS - 50)
    state.reportScroll(200, 1000, 400)
    vi.advanceTimersByTime(SCROLL_SETTLE_MS - 50)
    expect(state.isScrolling()).toBe(true)

    vi.advanceTimersByTime(50)
    expect(state.isScrolling()).toBe(false)
  })

  it('derives position state from the reported geometry', () => {
    state.reportScroll(100, 1000, 400)
    expect(state.isAtTop()).toBe(false)
    expect(state.isAtBottom()).toBe(false)

    state.reportScroll(0, 1000, 400)
    expect(state.isAtTop()).toBe(true)
    expect(state.isAtBottom()).toBe(false)

    state.reportScroll(600, 1000, 400)
    expect(state.isAtTop()).toBe(false)
    expect(state.isAtBottom()).toBe(true)
  })

  it('reports initial geometry without counting it as scrolling', () => {
    state.reportGeometry(0, 300, 400)

    expect(state.isScrolling()).toBe(false)
    // content shorter than the viewport is both at top and at bottom
    expect(state.isAtTop()).toBe(true)
    expect(state.isAtBottom()).toBe(true)
  })
})
