import {
  FormMutationService,
  FormMutationState,
} from '@app/forms/utilities/form-mutation'
import {
  Component,
  OnDestroy,
  signal,
  WritableSignal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core'
import {
  ApiKeysGQL,
  GenerateApiKeyGQL,
  GenerateApiKeyMutation,
  GenerateApiKeyMutationVariables,
  RevokeApiKeyGQL,
  RevokeApiKeyMutation,
  RevokeApiKeyMutationVariables,
} from './user-api-keys.mutation.gql.generated'
import {
  ApiKey,
  GenerateApiKeyInput,
  Maybe,
  RevokeApiKeyInput,
} from '@app/generated/civic.apollo.types'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzFormModule } from 'ng-zorro-antd/form'
import { CvcFormErrorsAlertModule } from '@app/forms/components/form-errors-alert/form-errors-alert.module'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'

import { Subject } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTooltipModule } from 'ng-zorro-antd/tooltip'
import { isNonNulled } from 'rxjs-etc'
import { onlyCompleteData } from 'apollo-angular'
import { NzMessageService } from 'ng-zorro-antd/message'

@Component({
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    ReactiveFormsModule,
    NzCardModule,
    NzAlertModule,
    NzRadioModule,
    NzButtonModule,
    NzSpinModule,
    NzListModule,
    NzTypographyModule,
    NzIconModule,
    NzTooltipModule,
    CvcFormErrorsAlertModule,
  ],
  selector: 'cvc-user-api-keys-form',
  templateUrl: './user-api-keys.form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./user-api-keys.form.less'],
})
export class CvcUserApiKeysForm implements OnDestroy {
  private formMutation = inject(FormMutationService)

  private mutationState?: FormMutationState
  private pendingMessage: string = ''

  get success(): boolean {
    return this.mutationState?.success() ?? false
  }
  get successMessage(): string {
    return this.success ? this.pendingMessage : ''
  }
  get errorMessages(): string[] {
    return (this.mutationState?.errors() ?? []).map((e) => e.message)
  }
  get loading(): boolean {
    return this.mutationState?.isSubmitting() ?? false
  }

  private destroy$ = new Subject<void>()

  apiKeys: WritableSignal<ApiKey[]> = signal([])
  newApiKey: WritableSignal<Maybe<ApiKey>> = signal(undefined)

  constructor(
    private generateApiKeyGql: GenerateApiKeyGQL,
    private revokeApiKeyGql: RevokeApiKeyGQL,
    private apiKeysGql: ApiKeysGQL,
    private message: NzMessageService
  ) {
    apiKeysGql
      .watch()
      .valueChanges.pipe(onlyCompleteData(), takeUntil(this.destroy$))
      .subscribe(({ data }) => {
        if (data.viewer?.apiKeys) {
          this.apiKeys.set(data.viewer.apiKeys)
        }
      })
  }

  revokeKey(id: number) {
    let input: RevokeApiKeyInput = {
      id: id,
    }

    let state = this.formMutation.mutate(
      this.revokeApiKeyGql,
      { input: input },
      { refetchQueries: [{ query: this.apiKeysGql.document }] }
    )
    this.manageState(state, 'API Key Revoked Successfully')
  }

  generateKey() {
    let input: GenerateApiKeyInput = {}

    let state = this.formMutation.mutate(
      this.generateApiKeyGql,
      { input: input },
      {},
      (data) => {
        this.newApiKey.set(data.generateApiKey?.apiKey)
      }
    )

    this.manageState(
      state,
      'API Key Created. Store It Somewhere Safe, You Will Not Be Able To See It Again'
    )
  }

  copyKey(key?: string) {
    if (key) {
      navigator.clipboard.writeText(key)
      this.message.info('Copied')
    }
  }

  manageState(state: FormMutationState, message: string) {
    this.mutationState = state
    this.pendingMessage = message
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
