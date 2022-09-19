import { Injectable } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { MixinConstructor } from 'ts-mixin-extended'
import { Maybe } from '@app/generated/civic.apollo'
import {
  EvidenceFieldSubjectMap,
  EvidenceOptionsSubjectMap,
  EvidenceRequiresSubjectMap,
  EvidenceState,
} from '../states/evidence.state'

type FormState = EvidenceState
type FieldSubject = keyof EvidenceFieldSubjectMap
type OptionSubject = keyof EvidenceOptionsSubjectMap
type RequiresSubject = keyof EvidenceRequiresSubjectMap
// TODO: create type that includes all field value types -
// something that iterates through all keys of FieldSubject
// and includes those keys' types
// type FieldValue = typeof

export type ConnectStateOptions = {
  emitValues?: FieldSubject
  subscribeValues?: FieldSubject[]
  subscribeOptions?: OptionSubject[]
  subscribeRequires?: RequiresSubject[]
}

export function ConnectState<ST extends FormState>() {
  return function ConnectStateConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class ConnectStateMixin extends Base {
      onValueChange$!: Subject<Maybe<string | number>>
      valueChange$?: Subject<Maybe<string | number>>

      configureConnectState(state: FormState, options: ConnectStateOptions) {
        // set up value changes emit
        if (options.emitValues) {
          this.valueChange$ = state.fields[options.emitValues]
        }
      }
    }

    return ConnectStateMixin
  }
}
