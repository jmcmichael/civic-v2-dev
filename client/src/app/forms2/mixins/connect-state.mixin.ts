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

type TypesIn<T> = { [K in keyof T]: T[K] }[keyof T]

type FormState = EvidenceState

type FieldSubjectName = keyof EvidenceFieldSubjectMap
type FieldSubject = TypesIn<EvidenceFieldSubjectMap>

type OptionSubjectName = keyof EvidenceOptionsSubjectMap
type OptionSubject = TypesIn<EvidenceOptionsSubjectMap>

type RequiresSubjectName = keyof EvidenceRequiresSubjectMap
type RequiresSubject = TypesIn<EvidenceRequiresSubjectMap>

export type ConnectStateOptions = {
  // subject from which target component emits change values
  valueChanges?: FieldSubjectName
  // subjects to which target component subscribes to get change values
  subscribeValues?: FieldSubjectName[]
  // subjects to which enum field types subscribe to get valid options
  subscribeOptions?: OptionSubjectName[]
  // subjects to which field types subscribe to get required fields
  subscribeRequires?: RequiresSubjectName[]
}

export function ConnectState() {
  return function ConnectStateConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class ConnectStateMixin extends Base {
      state!: FormState
      valueChange$?: FieldSubject

      configureConnectState(state: FormState, options: ConnectStateOptions) {
        this.state = state
        // set up value changes emit
        if (options.valueChanges) {
          this.valueChange$ = this.state.fields[options.valueChanges]
        }
      }
    }

    return ConnectStateMixin
  }
}
