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
export type FormState = EvidenceState

export type FieldSubject = EvidenceFieldSubject
export type FieldSubjectName = EvidenceFieldSubjectName

export type OptionsSubject = EvidenceOptionsSubject
export type OptionsSubjectName = EvidenceOptionsSubjectName

export type RequiresSubject = EvidenceRequiresSubject
export type RequiresSubjectName = EvidenceRequiresSubjectName

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

export type FieldStateSubjects = {
  values: { [key in FieldSubjectName]?: FieldSubject }
  options: { [key in OptionsSubjectName]?: OptionsSubject }
  requires: { [key in RequiresSubjectName]?: RequiresSubject }
}

// NOTE: this mixin isn't currently used but has some convenience types that might
// be made useful in a form state module, or barrell index.ts
// e.g. 'FieldSubject' could be a useful type as it will contain all state field subject types

// FT = FieldType, FS = FieldSubject, OS = OptionsSubject, RS = RequiresSubject
export function ConnectState() {
  return function ConnectStateConstructor<
    TBase extends MixinConstructor<FieldType>
  >(Base: TBase) {
    @Injectable()
    abstract class ConnectStateMixin extends Base {
      state!: FormState
      valueChange$?: FieldSubject
      stateSubjects: FieldStateSubjects = {
        values: {},
        options: {},
        requires: {},
      }
      configureConnectState(
        state: FormState,
        options: ConnectStateOptions
      ) {
        this.state = state
        // set up value changes emit
        if (options.valueChanges) {
          this.valueChange$ = this.state.fields[options.valueChanges]
        }

        // set up subscribe changes
        if (options.subscribeValues) {
          options.subscribeValues.forEach((s: FieldSubjectName) => {
            this.stateSubjects.values[s] = state.fields[s]
          })
        }
      }
    }

    return ConnectStateMixin
  }
}
