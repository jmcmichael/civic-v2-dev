import { TestBed } from '@angular/core/testing'
import { ServerError } from '@apollo/client/errors'
import { FormSubmissionError } from '@app/core/utilities/submission-errors'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorsService } from './app-errors.service'

function setup() {
  TestBed.configureTestingModule({})
  const service = TestBed.inject(AppErrorsService)
  const notified = vi.fn()
  service.notify$.subscribe(notified)
  return { service, notified }
}

describe('AppErrorsService', () => {
  it('collects network failures for the blocking modal', () => {
    const { service, notified } = setup()
    service.report(
      new ServerError('Received status code 502', {
        response: new Response(null, { status: 502 }),
        bodyText: '',
      })
    )
    expect(service.modalErrors()).toMatchObject([
      { category: 'network', code: '502' },
    ])
    expect(notified).not.toHaveBeenCalled()
  })

  it('routes other categories to notifications, tagged with the operation', () => {
    const { service, notified } = setup()
    service.report(new Error('boom'), 'SubmitEvidenceItem')
    expect(service.modalErrors()).toEqual([])
    expect(notified).toHaveBeenCalledWith([
      expect.objectContaining({
        category: 'code',
        meta: [{ label: 'operation', value: 'SubmitEvidenceItem' }],
      }),
    ])
  })

  it('escalates a notified batch into the modal, and clears it', () => {
    const { service } = setup()
    const batch: FormSubmissionError[] = [
      { category: 'cache', message: 'write failed' },
    ]
    service.escalate(batch)
    expect(service.modalErrors()).toEqual(batch)
    service.clearModal()
    expect(service.modalErrors()).toEqual([])
  })

  it('flags a stale chunk for the reload prompt', () => {
    const { service } = setup()
    expect(service.staleChunk()).toBe(false)
    service.promptStaleChunk()
    expect(service.staleChunk()).toBe(true)
  })
})
