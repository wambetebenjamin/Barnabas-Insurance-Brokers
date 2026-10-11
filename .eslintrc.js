/**
 * ESLint configuration.
 *
 * Two rules are switched off for src/app/layout.tsx, deliberately:
 *
 *   @next/next/no-css-tags  and  @next/next/no-page-custom-font
 *
 * The design source (Insure v1.0.0) loads Bootstrap, the template stylesheet, the
 * icon fonts and the two Google font families from plain <link> tags in <head>, in a
 * specific order that the cascade depends on. The brief requires that order to be
 * reproduced verbatim, so the tags stay as tags. Moving them into next/font or a CSS
 * import would change the cascade and, with it, the rendering.
 */
module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // The source template ships <img> markup in places we keep as-is.
    "@next/next/no-img-element": "off",
    "jsx-a11y/alt-text": "warn",
  },
  overrides: [
    {
      files: ["src/app/layout.tsx"],
      rules: {
        "@next/next/no-css-tags": "off",
        "@next/next/no-page-custom-font": "off",
      },
    },
  ],
  ignorePatterns: [
    "_source/**",
    "public/**",
    ".next/**",
    "node_modules/**",
    "src/content/**",
    "scripts/**",
  ],
};
