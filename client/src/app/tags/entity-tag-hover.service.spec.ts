import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EntityTagHoverService } from './entity-tag-hover.service'

describe('EntityTagHoverService', () => {
  let service: EntityTagHoverService

  beforeEach(() => {
    vi.useFakeTimers()
    service = TestBed.inject(EntityTagHoverService)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts cold, with the stock enter delay', () => {
    expect(service.warm()).toBe(false)
    expect(service.enterDelay()).toBeGreaterThan(0)
  })

  it('opens instantly while the user keeps scanning', () => {
    service.noteActivity()
    expect(service.enterDelay()).toBe(0)

    vi.advanceTimersByTime(900)
    expect(service.enterDelay()).toBe(0)
  })

  it('cools down a second after the last interaction', () => {
    service.noteActivity()
    vi.advanceTimersByTime(1000)
    expect(service.warm()).toBe(false)
    expect(service.enterDelay()).toBeGreaterThan(0)
  })

  it('each interaction restarts the window', () => {
    service.noteActivity()
    vi.advanceTimersByTime(900)
    service.noteActivity()
    vi.advanceTimersByTime(900)
    expect(service.warm()).toBe(true)

    vi.advanceTimersByTime(100)
    expect(service.warm()).toBe(false)
  })
})
