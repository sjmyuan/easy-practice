# Example: New Feature Documentation

**Scenario**: Added i18n support with LanguageContext and locale files

**Change Type**: New Feature

**Documentation Updates**:

## 1. requirements.md

Added section: "The application must support multiple languages (English, Chinese) with runtime language switching."

## 2. architecture.md

```markdown
### Internationalization

**Pattern**: React Context + JSON locale files
**Components**: LanguageContext provides `t()` translation function
**Locale Files**: `/locales/{lang}.json` contain translations
**Language Detection**: Reads browser preference, falls back to English
```

## 3. README.md

```markdown
## Adding New Languages

1. Create `/locales/{lang-code}.json` with translations
2. Add language option to LanguageSelector component
3. Import locale file in `/locales/index.ts`
```

## 4. Usage Example (in README or separate guide)

```typescript
import { useLanguage } from '@/contexts';

function MyComponent() {
  const { t } = useLanguage();
  return <h1>{t('welcome_message')}</h1>;
}
```

---

## Key Documentation Characteristics

- **Change Type**: New Feature
- **Documentation Scope**: Requirements, Architecture, README, Usage Examples
- **Primary Focus**: Feature overview, architecture explanation, developer guide
- **Impact Level**: Major (new system-wide capability)
