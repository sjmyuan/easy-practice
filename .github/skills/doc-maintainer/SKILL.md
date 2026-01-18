---
name: doc-maintainer
description: Update project documentation to reflect code changes (bug fixes, refactors, or new features). Provide concise, actionable edits to requirements, architecture, README, and related docs. Use this skill when code changes occur.
---

<when-to-use-this-skill>
- Use when code changes (bug fix, refactor, or new feature) affect public behavior, APIs, developer workflows, or user-facing documentation.
- Use when documentation is stale relative to code, tests, or CI configuration.
</when-to-use-this-skill>

<docs>
- requirement
- architecture
- README
- changelog or release notes (when applicable)
- examples and usage snippets (inline docs, demos)
</docs>

<capabilities>

<maintaining-docs>
- Review the change and chat history: Identify what was modified (behavior, API, UX, dependencies, setup).
- Identify affected docs: Determine which documentation needs updates (requirements, architecture, README, examples, changelog).
- Summarize updates: For each affected doc, briefly describe what changed, why, and the impact on developers or users.
- Make focused edits: Limit changes to relevant sections; avoid broad rewrites unless necessary.
- Provide migration steps: If changes require user or developer action, include clear, step-by-step instructions.
- Update examples: Add or revise usage examples or configuration snippets to illustrate new behavior.
- Reference sources: Link to the code, tests, or PR introducing the change for verification.
- Record decisions: Document the reasoning behind design or architecture changes in appropriate notes.
</maintaining-docs>

</capabilities>

<rules>

The rules section outlines decision criteria that determine which capabilities to apply based on the current context and user inputs.

<rule> When code changes occur, apply the **maintaining-docs** capability to update all relevant documentation accordingly. </rule>

</rules>