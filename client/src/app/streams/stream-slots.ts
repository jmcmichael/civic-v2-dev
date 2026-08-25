import { Directive } from '@angular/core'

/**
 * Marks a stream's projected sidebar panel — filter selects, facet lists,
 * whatever the facade puts beside its list. The stream renders its sidebar
 * column only when content with this directive is projected, so the marker
 * is a directive rather than a bare attribute: presence is what drives the
 * layout.
 *
 * The other projection slots (`cvcStreamHeaderExtra`, `cvcStreamBanner`)
 * are plain `ng-content` selectors — nothing reads their presence.
 */
@Directive({ selector: '[cvcStreamSidebar]' })
export class CvcStreamSidebarDirective {}
