import { TestBed } from '@angular/core/testing'
import { CvcEdge } from '@app/tables/connection.types'
import { SizeStrategy } from 'vscroll'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_STREAM_SCROLLER_SETTINGS } from '../entity-stream-config'
import { CvcStreamScrollState } from './stream-scroll-state'
import { createVscrollEngine } from './vscroll-engine'

/**
 * The engine's assembly logic — settings mapping and range delegation. The
 * engine's rendering behavior needs a real layout engine and is covered by
 * the browser-level golden spec, not here.
 */

function state(): CvcStreamScrollState {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [CvcStreamScrollState] })
  return TestBed.inject(CvcStreamScrollState)
}

function edge(cursor: string): CvcEdge<{ id: number }> {
  return { cursor, node: { id: Number.parseInt(cursor, 10) } }
}

describe('createVscrollEngine', () => {
  it('maps the stream scroller settings onto the datasource', () => {
    const engine = createVscrollEngine({
      getRange: () => Promise.resolve([]),
      settings: {
        bufferSize: 10,
        itemSize: 100,
        sizeStrategy: 'average',
        padding: 0.5,
      },
      state: state(),
    })

    expect(engine.datasource.settings).toEqual({
      bufferSize: 10,
      minIndex: 0,
      startIndex: 0,
      itemSize: 100,
      sizeStrategy: SizeStrategy.Average,
      padding: 0.5,
    })
  })

  it('maps every size strategy name onto its engine value', () => {
    const strategies = {
      average: SizeStrategy.Average,
      frequent: SizeStrategy.Frequent,
      constant: SizeStrategy.Constant,
    } as const

    for (const [name, value] of Object.entries(strategies)) {
      const engine = createVscrollEngine({
        getRange: () => Promise.resolve([]),
        settings: {
          ...DEFAULT_STREAM_SCROLLER_SETTINGS,
          sizeStrategy: name as keyof typeof strategies,
        },
        state: state(),
      })
      expect(engine.datasource.settings?.sizeStrategy).toBe(value)
    }
  })

  it('delegates range requests and hands the engine a fresh mutable array', async () => {
    const edges = [edge('1'), edge('2')]
    const getRange = vi.fn(() =>
      Promise.resolve(edges as ReadonlyArray<CvcEdge<{ id: number }>>)
    )
    const engine = createVscrollEngine({
      getRange,
      settings: DEFAULT_STREAM_SCROLLER_SETTINGS,
      state: state(),
    })

    const get = engine.datasource.get as (
      index: number,
      count: number
    ) => Promise<CvcEdge<{ id: number }>[]>
    const result = await get(0, 2)

    expect(getRange).toHaveBeenCalledWith(0, 2)
    expect(result).toEqual(edges)
    expect(result).not.toBe(edges)
  })

  it('tolerates reload/check before the scroller has attached', () => {
    const engine = createVscrollEngine({
      getRange: () => Promise.resolve([]),
      settings: DEFAULT_STREAM_SCROLLER_SETTINGS,
      state: state(),
    })

    expect(() => {
      engine.reload()
      engine.check()
    }).not.toThrow()
  })
})
