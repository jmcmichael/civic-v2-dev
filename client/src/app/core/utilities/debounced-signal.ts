import { Signal } from '@angular/core'
import { toObservable, toSignal } from '@angular/core/rxjs-interop'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

/**
 * A read-only view of `source` that re-emits only after `ms` of quiet,
 * optionally deduplicated by `equal`.
 *
 * The signal→observable→signal round trip is deliberate: Angular has no
 * native time-based signal primitive, and this is the documented interop
 * pattern for debouncing one. The trip lives here so the idiom has one home
 * and one explanation instead of an inline copy per call site.
 *
 * Must be called in an injection context (field initializer or constructor),
 * like `toSignal` itself. The result is `undefined` until the first quiet
 * period elapses — consumers must tolerate that initial undefined.
 */
export function debouncedSignal<T>(
  source: Signal<T>,
  ms: number,
  equal?: (a: T, b: T) => boolean
): Signal<T | undefined> {
  const debounced = toObservable(source).pipe(debounceTime(ms))
  return toSignal(
    equal ? debounced.pipe(distinctUntilChanged(equal)) : debounced
  )
}
