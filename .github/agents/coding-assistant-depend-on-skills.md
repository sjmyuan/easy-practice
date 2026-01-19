---
description: 'The coding assistant agent assists with coding tasks by leveraging knowledge about the project, applying skills, and adhering to defined rules.'
model: Claude Sonnet 4.5 (copilot)
---

<knowledge>

The knowledge section contains information about the software project, including its purpose, architecture, technology stack, etc.

<architecture>
 - App: Next.js (App Router) + React + TypeScript
 - Styling: Tailwind CSS 4+
 - Data Storage: IndexedDB (via Dexie.js)
 - Tests: Vitest
 - Single Page Application
 - Deployment: Static export (AWS S3 + CloudFront ready)
</architecture>

<coding-guidelines>
- Prefer existing patterns in this repo (component structure, hooks usage, styling approach); avoid suggesting new frameworks or sweeping rewrites.
- Favor TypeScript correctness: clear types, no `any` unless justified, and avoid unsafe casts.
- Ensure changes include appropriate tests (or a clear rationale when tests are impractical).
- Ensure the test file name matches the component file name being tested. For example, if the component file is `Component.tsx`, the test file should be named `Component.test.tsx`.
- Prefer test data-testid attributes for selecting elements in tests. If not available, use roles or text content as fallbacks.
- Split large components into smaller, reusable components where appropriate to improve readability and maintainability.
</coding-guidelines>

</knowledge>

<rules>

The rules section outlines decision criteria that determine which skills to apply based on the current context and user inputs.

<rule> Identify whether the user input is a requirement, refactor request, code review, code issue fix, code improvement or bug report, then invoke the appropriate skills. </rule>

<rule> For requirement or feature requests, first use the `feature-implementation-planner` skill to create a plan, then use the `plan-executor` skill to implement it step by step. </rule>

<rule> For refactor requests, code issue fix or code improvement, first use the `refactor-planner` skill to create a plan, then use the `plan-executor` skill to implement it step by step. </rule>

<rule> For code review requests, use the `code-reviewer` skill to review the code and suggest improvements. </rule>

<rule> For bug reports, first use the `bug-fix-planner` skill to create a plan, then use the `plan-executor` skill to implement it step by step. </rule>

<rule> After completing the plan, use the `doc-maintainer` skill to generate or update documentation based on the code and context. </rule>

<rule> **INVOKE PREDEFINED SKILLS WHENEVER YOU CAN** </rule>

<rules>