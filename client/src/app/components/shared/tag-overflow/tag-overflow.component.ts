import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core'
import { Maybe } from '@app/generated/civic.apollo.types'

export type SupportedPileupTags =
  | 'therapy'
  | 'disease'
  | 'gene'
  | 'feature'
  | 'organization'
  | 'variant'
  | 'variant-type'
  | 'variant-feature'

export type TagInfo = {
  id: number
  name: string
  link: string
  matchText?: string
}

/**
 * The template-outlet context for one tag. Built once per input change and
 * held on the component: an inline `{ tagType, tag }` literal in the template
 * is a NEW object every change-detection pass, and `NgTemplateOutlet`
 * recreates its embedded view when the context object's identity changes —
 * destroying every tag component (and killing any popover it was about to
 * open, or had open) on every CD tick of the host.
 */
export type TagOutletContext = {
  tagType: Maybe<SupportedPileupTags>
  tag: TagInfo
  /** whether this tag matches the current filter text (case-insensitive) */
  matched: boolean
}

function populateMatchText(input: Maybe<TagInfo[]>): Maybe<TagInfo[]> {
  return input?.map((t) => {
    if (!t.matchText) {
      return {
        ...t,
        matchText: t.name,
      }
    } else {
      return t
    }
  })
}

@Component({
  selector: 'cvc-tag-overflow',
  templateUrl: './tag-overflow.component.html',
  styleUrls: ['./tag-overflow.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CvcTagOverflowComponent implements OnChanges {
  @Input({ transform: populateMatchText }) tags: Maybe<TagInfo[]>
  @Input() maxDisplayCount: number = 2
  @Input() matchingText?: string
  @Input() tagType: Maybe<SupportedPileupTags>
  @Input() thisOne = false
  @Input() enablePopover?: boolean = true

  displayedTags?: TagInfo[]
  hiddenTags?: TagInfo[]
  /** stable outlet contexts — see `TagOutletContext` for why these exist */
  displayedContexts?: TagOutletContext[]
  hiddenContexts?: TagOutletContext[]
  hiddenCount?: number
  matchedHiddenCount: number = 0

  trackByTagId = (_index: number, ctx: TagOutletContext): number => ctx.tag.id

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(_: SimpleChanges): void {
    // if (this.thisOne) console.log(changes);
    // displayedTags: this.displayedTags,
    // hiddenTags: this.hiddenTags,
    // hiddenCount: this.hiddenCount,
    // matchingText: this.matchingText
    this.calculateDisplayedTags()
  }

  calculateDisplayedTags() {
    // matching tags move to the front of the line: a filtered column's
    // match is usually the tag the user typed, and it would otherwise sit
    // unseen in the overflow popover. Stable partition — matches keep
    // their relative order, and so does the rest of the line behind them.
    const text = this.matchingText?.toLowerCase()
    const isMatch = (t: TagInfo): boolean =>
      !!text && t.matchText!.toLowerCase().includes(text)
    let tags = this.tags
    if (tags && text) {
      const matches = tags.filter(isMatch)
      if (matches.length > 0) {
        tags = [...matches, ...tags.filter((t) => !matches.includes(t))]
      }
    }
    this.displayedTags = tags?.slice(0, this.maxDisplayCount)
    this.hiddenTags = tags?.slice(this.maxDisplayCount)
    this.hiddenCount = this.hiddenTags?.length
    this.displayedContexts = this.displayedTags?.map((tag) => ({
      tagType: this.tagType,
      tag,
      matched: isMatch(tag),
    }))
    this.hiddenContexts = this.hiddenTags?.map((tag) => ({
      tagType: this.tagType,
      tag,
      matched: isMatch(tag),
    }))
    this.matchedHiddenCount =
      this.hiddenContexts?.filter((ctx) => ctx.matched).length ?? 0

    this.cdr.detectChanges()
  }

  // removed the template (click) emitter for onOverflowClicked, since
  // we're using these overflow components in fixed-height rows
  // which will clip the additional tags. TODO: delete if we decide
  // to keep this new behavior
  // onOverflowClicked() {
  //   this.maxDisplayCount = this.tags?.length || 0
  //   this.calculateDisplayedTags()
  // }
}
