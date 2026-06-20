export const CODE_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "sql",
  "json",
  "bash",
  "html",
  "css",
  "java",
  "go",
  "rust",
  "yaml",
  "markdown",
  "plaintext",
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

export const CODE_LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  sql: "SQL",
  json: "JSON",
  bash: "Bash",
  html: "HTML",
  css: "CSS",
  java: "Java",
  go: "Go",
  rust: "Rust",
  yaml: "YAML",
  markdown: "Markdown",
  plaintext: "Plain text",
};

/** Maps our language ids to react-syntax-highlighter language keys */
export const HIGHLIGHTER_LANGUAGE: Record<CodeLanguage, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  sql: "sql",
  json: "json",
  bash: "bash",
  html: "html",
  css: "css",
  java: "java",
  go: "go",
  rust: "rust",
  yaml: "yaml",
  markdown: "markdown",
  plaintext: "text",
};
