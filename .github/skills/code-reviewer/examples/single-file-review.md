# Example: Single File Review (Feature Addition)

**Scenario**: Review of a new `LanguageSelector.tsx` component

**Review Focus**: Correctness, accessibility, maintainability

## Code Review Summary

**Scope**: New `LanguageSelector.tsx` component
**Focus**: Correctness, accessibility, maintainability
**Overall Assessment**: Ready to merge after fixing 1 major issue

---

## Findings

### 🔴 Major Issues

#### Missing Keyboard Navigation
- **File**: [LanguageSelector.tsx](LanguageSelector.tsx#L15-L20)
- **Issue**: Dropdown not keyboard accessible (no onKeyDown handler, no aria-expanded)
- **Impact**: Users relying on keyboard navigation cannot change language
- **Recommendation**: Add keyboard handlers and ARIA attributes:
```tsx
<button
  onClick={toggleDropdown}
  onKeyDown={(e) => e.key === 'Enter' && toggleDropdown()}
  aria-expanded={isOpen}
  aria-haspopup="true"
>
```

### 🟡 Minor Issues

#### Hardcoded Language Options
- **File**: [LanguageSelector.tsx](LanguageSelector.tsx#L8-L12)
- **Issue**: Language list hardcoded in component rather than from config/constants
- **Impact**: Adding languages requires component changes
- **Recommendation**: Move to `lib/constants.ts` as `SUPPORTED_LANGUAGES`

---

## Positive Highlights
- Clear prop types with TypeScript
- Good separation of concerns (UI vs. logic)
- Clean styling with Tailwind

---

## Recommended Next Steps
1. Fix keyboard accessibility (blocker for a11y compliance)
2. Consider extracting language options to constants

---

## Key Review Characteristics

- **Review Type**: Single file (new feature)
- **Severity Distribution**: 1 major, 1 minor
- **Primary Concerns**: Accessibility and maintainability
- **Action Required**: Must fix major issue before merge
