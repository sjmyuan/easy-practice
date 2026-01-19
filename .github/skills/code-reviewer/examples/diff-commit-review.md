# Example: Diff/Commit Review (Bug Fix)

**Scenario**: Review of a bug fix commit for issue #123 - session timer not resetting

**Review Focus**: Correctness, regression prevention

## Code Review Summary

**Scope**: Fix for issue #123 - session timer not resetting
**Focus**: Correctness, regression prevention
**Overall Assessment**: Requires test coverage before merge

---

## Findings

### 🔴 Major Issues

#### Missing Test for Bug Fix
- **File**: Tests missing for [SessionTimer.tsx](SessionTimer.tsx#L45-L48)
- **Issue**: No test verifying timer resets when session restarts
- **Impact**: Risk of regression in future refactors
- **Recommendation**: Add test case:
```tsx
it('resets timer when session restarts', () => {
  const { rerender } = render(<SessionTimer sessionId="1" />);
  // advance timer
  rerender(<SessionTimer sessionId="2" />);
  expect(screen.getByText(/00:00/)).toBeInTheDocument();
});
```

### 🟢 Nits / Suggestions

#### useEffect Dependency Could Be More Specific
- **File**: [SessionTimer.tsx](SessionTimer.tsx#L45)
- **Issue**: Resets on any prop change, not just `sessionId`
- **Impact**: None currently, but could cause unexpected resets if props added
- **Recommendation**: Use `sessionId` in dependency array instead of recreating effect

---

## Positive Highlights
- Root cause correctly identified and fixed
- Clean, minimal change

---

## Recommended Next Steps
1. Add regression test (required)
2. Consider dependency array refinement (optional)

---

## Key Review Characteristics

- **Review Type**: Diff/commit (bug fix)
- **Severity Distribution**: 1 major, 1 nit
- **Primary Concerns**: Test coverage and regression prevention
- **Action Required**: Must add test before merge
