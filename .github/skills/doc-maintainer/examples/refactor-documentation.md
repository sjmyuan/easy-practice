# Example: Refactor Documentation

**Scenario**: Extracted session state management into `useSession` hook

**Change Type**: Refactor

**Documentation Updates**:

## 1. architecture.md

```markdown
### State Management Hooks

**useSession**: Manages practice session lifecycle
- Location: `/hooks/useSession.ts`
- Responsibilities: session creation, problem tracking, completion
- Used by: PracticeSessionView, SessionCompleteView
```

## 2. Developer Guide (if exists)

```markdown
## Working with Sessions

Instead of managing session state directly, use the `useSession` hook:

```typescript
const { session, startSession, endSession, nextProblem } = useSession();
```

This hook handles:
- Database persistence
- Problem selection logic
- Session timer coordination
```

## 3. Inline Documentation

Added comprehensive JSDoc to `useSession.ts` explaining all exported functions and return values

---

## Key Documentation Characteristics

- **Change Type**: Refactor
- **Documentation Scope**: Architecture, Developer Guide, Inline Documentation
- **Primary Focus**: Code organization, usage patterns, developer experience
- **Impact Level**: Medium (affects developer workflow)
