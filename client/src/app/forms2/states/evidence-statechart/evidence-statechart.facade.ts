// to be based on: https://github.com/stefanoslig/xstate-angular/blob/main/apps/conduit/src/app/article-list/%2Bxstate/article-list-machine.facade.ts

import { Injectable } from '@angular/core'
import { EvidenceItemSubmitFields } from '@app/forms2/models/evidence-submit.model'
import { Maybe } from '@app/generated/civic.apollo'
import { Observable } from 'rxjs'
import { pluck } from 'rxjs-etc/dist/esm/operators'
import { EvidenceItemStateService } from './evidence-statechart.service'

@Injectable()
export class EvidenceItemStateFacade {
  state$ = this.eidState.service.state$
  send = this.eidState.service.send

  field$: Observable<EvidenceItemSubmitFields>
  geneId$: Observable<Maybe<number>>
  variantId$: Observable<Maybe<number>>

  constructor(private eidState: EvidenceItemStateService) {
    this.field$ = this.state$.pipe(pluck('fields'))
    this.geneId$ = this.field$.pipe(pluck('geneId'))
    this.variantId$ = this.field$.pipe(pluck('variantId'))
  }

}
