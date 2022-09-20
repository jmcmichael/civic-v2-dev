import { Injectable } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { Subject } from 'rxjs'
import { MixinConstructor } from 'ts-mixin-extended'
import { Maybe } from '@app/generated/civic.apollo'
import {
    EvidenceFieldSubject,
  EvidenceFieldSubjectName,
  EvidenceOptionsSubject,
  EvidenceOptionsSubjectName,
  EvidenceRequiresSubject,
  EvidenceRequiresSubjectName,
  EvidenceState,
} from '../states/evidence.state'

// as state classes are added, append each of the below with 'or', e.g.
// type FormState = EvidenceState | AssertionState
// type FieldSubjectName = EvidenceFieldSubjectName | AssertionFieldSubjectName
type FormState = EvidenceState

type FieldSubject = EvidenceFieldSubject
type FieldSubjectName = EvidenceFieldSubjectName

type OptionsSubject = EvidenceOptionsSubject
type OptionsSubjectName = EvidenceOptionsSubjectName

type RequiresSubject = EvidenceRequiresSubject
type RequiresSubjectName = EvidenceRequiresSubjectName

export type ConnectStateOptions = {
  // subject from which target component emits change values
  valueChanges?: FieldSubjectName
  // subjects to which target component subscribes to get change values
  subscribeValues?: FieldSubjectName[]
  // subjects to which enum field types subscribe to get valid options
  subscribeOptions?: OptionsSubjectName[]
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
