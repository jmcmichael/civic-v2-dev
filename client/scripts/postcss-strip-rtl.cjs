// Strips right-to-left rules from the ng-zorro theme — the app is LTR-only
// (no dir="rtl" support), but ant ships RTL variants for every component,
// ~17% of the compiled global stylesheet. Loaded via postcss.config.json,
// which the @angular/build application builder picks up for all stylesheets.
const RTL_SELECTOR = /\[dir=(?:"|')?rtl(?:"|')?\]|-rtl\b/

// A selector is RTL only when an rtl marker appears as a POSITIVE component.
// One inside `:not(...)` means the opposite — an LTR-only rule excluding its
// RTL sibling (ant's space-compact corner rules are all shaped this way), and
// stripping those removed the whole button-group border collapse.
const isRtlSelector = (s) => RTL_SELECTOR.test(s.replace(/:not\([^)]*\)/g, ''))

module.exports = () => ({
  postcssPlugin: 'postcss-strip-rtl',
  Rule(rule) {
    if (
      rule.parent?.type === 'atrule' &&
      rule.parent.name.endsWith('keyframes')
    )
      return
    const kept = rule.selectors.filter((s) => !isRtlSelector(s))
    if (kept.length === 0) rule.remove()
    else if (kept.length < rule.selectors.length) rule.selectors = kept
  },
  AtRuleExit(atRule) {
    // drop @media/@supports blocks emptied by rule removal
    if (
      (atRule.name === 'media' || atRule.name === 'supports') &&
      atRule.nodes.length === 0
    )
      atRule.remove()
  },
})
module.exports.postcss = true
