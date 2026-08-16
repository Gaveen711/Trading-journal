// Vitest setup: registers jest-dom matchers (safe in node-env tests too).
// Component tests must opt into a DOM with a docblock at the top of the file:
//   // @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
