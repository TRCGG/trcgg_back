module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      "airbnb",
      "airbnb/hooks",
      "plugin:prettier/recommended",
    ],
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      tsconfigRootDir: __dirname,
      project: ["./tsconfig.json"],
    },
    ignorePatterns: [".eslintrc.js"],
    plugins: ["prettier"],
    rules: {
      "import/prefer-default-export": "off", // Named export
      "prettier/prettier": ["error", { endOfLine: "auto" }], // Prettier 규칙 적용
    },
  };