import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", ".next-build*/**", ".next-regression-build*/**"],
  },
  ...nextCoreWebVitals,
];

export default eslintConfig;
