require("@rushstack/eslint-patch/modern-module-resolution");

const path = require("path");

const tsConfig = path.resolve(__dirname, "tsconfig.json");

module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nosebit/eslint-config-typescript",
  ],
  parserOptions: {
    project: ["tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    /**
     * Check this:
     * https://github.com/typescript-eslint/typescript-eslint/issues/1824
     */
    "@typescript-eslint/indent": ["error", 2, {
      ignoredNodes: ["TSTypeParameterInstantiation"],
      // eslint-disable-next-line sort-keys
      SwitchCase: 1,
    }],
  },
  settings: {
    "import/external-module-folders": [
      "@niwini",
      "node_modules",
      ".yarn",
    ],
    "import/resolver": {
      typescript: {
        project: tsConfig,
      },
    },
  },
};
