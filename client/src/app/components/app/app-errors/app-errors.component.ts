import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  TemplateRef,
  viewChild,
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import {
  categoryName,
  CvcErrorListComponent,
} from '@app/components/app/error-list/error-list.component'
import { AppErrorsService } from '@app/core/services/app-errors.service'
import { FormSubmissionError } from '@app/core/utilities/submission-errors'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import {
  NzNotificationComponent,
  NzNotificationService,
} from 'ng-zorro-antd/notification'

/**
 * The display half of AppErrorsService, rendered once in the app
 * component: raises sticky error notifications (with View Details) for
 * notification-category errors, and opens the blocking centered modal —
 * mask up, no clickthrough until closed — listing modal-category errors
 * as a cvc-error-list. Also owns the stale-chunk reload prompt.
 */
@Component({
  selector: 'cvc-app-errors',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CvcErrorListComponent, NzButtonModule, NzIconModule, NzModalModule],
  templateUrl: './app-errors.component.html',
})
export class CvcAppErrorsComponent {
  protected readonly appErrors = inject(AppErrorsService)
  private modal = inject(NzModalService)
  private notification = inject(NzNotificationService)

  private readonly modalContent = viewChild<TemplateRef<{}>>('modalContent')
  private readonly modalFooter = viewChild<TemplateRef<{}>>('modalFooter')
  private readonly notifyButton =
    viewChild<TemplateRef<{ $implicit: NzNotificationComponent }>>(
      'notifyButton'
    )

  private modalRef?: NzModalRef

  constructor() {
    this.appErrors.notify$
      .pipe(takeUntilDestroyed())
      .subscribe((batch) => this.raiseNotification(batch))

    // the blocking modal opens while errors await it, closes when cleared
    effect(() => {
      const errors = this.appErrors.modalErrors()
      if (errors.length === 0) {
        this.modalRef?.close()
        this.modalRef = undefined
        return
      }
      const content = this.modalContent()
      if (this.modalRef || !content) return
      this.modalRef = this.modal.create({
        nzTitle: 'Application Errors',
        nzContent: content,
        nzFooter: this.modalFooter() ?? null,
        nzCentered: true,
        nzMaskClosable: false,
        nzWidth: 720,
      })
      this.modalRef.afterClose.subscribe(() => {
        this.modalRef = undefined
        this.appErrors.clearModal()
      })
    })

    effect(() => {
      if (this.appErrors.staleChunk()) {
        this.modal.confirm({
          nzTitle: 'CIViC has been updated',
          nzContent:
            'A new version of the app is available; reload to update. ' +
            'Unsaved form input will be lost.',
          nzOkText: 'Reload',
          nzCancelText: 'Later',
          nzCentered: true,
          nzMaskClosable: false,
          nzOnOk: () => window.location.reload(),
        })
      }
    })
  }

  private raiseNotification(batch: FormSubmissionError[]): void {
    const first = batch[0]
    const title = `${categoryName(first.category)} Error${
      batch.length > 1 ? 's' : ''
    }`
    this.notification.error(title, first.message, {
      // sticky, deduped: a repeat of the same failure updates in place
      // instead of stacking (also caps any error → notification loop)
      nzDuration: 0,
      nzKey: `${first.category}:${first.code ?? first.message}`,
      nzButton: this.notifyButton(),
      nzData: batch,
    })
  }

  protected openDetails(n: NzNotificationComponent): void {
    const batch = (n.instance.options?.nzData ?? []) as FormSubmissionError[]
    this.appErrors.escalate(batch)
    this.notification.remove(n.instance.messageId)
  }

  protected closeModal(): void {
    this.appErrors.clearModal()
  }
}
