module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['tailwind'] }],

    // BEM-style `.block--modifier` is this codebase's deliberate naming
    // convention throughout the design system, not a typo.
    'selector-class-pattern': null,

    // A hand-grown stylesheet not organized by selector specificity from day
    // one — reordering hundreds of rules to satisfy this risks changing which
    // rule wins in an override chain. Not worth the risk for a style nit.
    'no-descending-specificity': null,

    // `-webkit-background-clip`/`-webkit-mask-image`/`-webkit-appearance` here
    // are still functionally required in Safari, not leftover cruft.
    'property-no-vendor-prefix': null,

    // Purely cosmetic (one-line vs. multi-line rule bodies) with no autofixer;
    // a formatter's job, not a linter's. Not worth 270+ manual edits.
    'declaration-block-single-line-max-declarations': null,
  },
};
