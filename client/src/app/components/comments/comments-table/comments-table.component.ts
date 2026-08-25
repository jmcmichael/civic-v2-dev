import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'
import { CvcEntityTableComponent } from '@app/tables'
import { commentsTableConfig } from './comments-table.config'
import { CommentsBrowseGQL } from './comments-table.query.gql.generated'

/**
 * Browse-table facade over `cvc-entity-table`: keeps the legacy selector and
 * the input surface its 1 embed site binds (`ids`, `cvcTitle`), while the
 * table itself is configuration — see `comments-table.config.ts`.
 *
 * The `ids` scope input feeds the spec through a `computed`, so an embed
 * changing it (query-search re-runs) re-queries through the table's normal
 * debounced-variables path — no `ngOnChanges` refetch plumbing.
 *
 * No downloader: the legacy table never had one. The legacy
 * `initialPageSize` input had no consumers (grepped across the app) and is
 * dropped, matching the precedent set by the other migrated tables.
 */
@Component({
  selector: 'cvc-comments-table',
  imports: [CvcEntityTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cvc-entity-table
      [spec]="spec()"
      [titleTemplate]="cvcTitleTemplate()"
      [height]="cvcHeight() ?? '800px'" />
  `,
})
export class CvcCommentsTableComponent {
  private readonly gql = inject(CommentsBrowseGQL)

  readonly ids = input<Maybe<number[]>>()
  readonly cvcTitle = input<Maybe<string>>()
  readonly cvcTitleTemplate = input<Maybe<TemplateRef<void>>>()
  /** explicit body height; the default matches the legacy table's 800px */
  readonly cvcHeight = input<Maybe<string>>()

  protected readonly spec = computed(() =>
    commentsTableConfig(this.gql, this.cvcTitle(), {
      ids: this.ids(),
    })
  )
}
