# Example: Bug Fix Documentation

**Scenario**: Fixed SessionTimer component to pause when inactive

**Change Type**: Bug Fix

**Documentation Updates**:

## 1. troubleshooting.md (if it exists)

```markdown
## Timer continues during inactivity

**Fixed in v2.1.0**: Timer now correctly pauses when the tab is inactive.
Update to the latest version to resolve this issue.
```

## 2. changelog.md

```markdown
## [2.1.0] - 2026-01-18

### Fixed
- SessionTimer now pauses when browser tab is inactive (#42)
```

## 3. components/SessionTimer.tsx (inline docs)

Added JSDoc comment explaining the visibility API usage

---

## Key Documentation Characteristics

- **Change Type**: Bug Fix
- **Documentation Scope**: Troubleshooting, Changelog, Inline Comments
- **Primary Focus**: User-facing issue resolution and version tracking
- **Impact Level**: Minor (specific component behavior)
