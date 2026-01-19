# Example: Data Persistence Bug Fix

**Scenario**: Session progress lost on browser refresh

**Root Cause**: IndexedDB transactions not properly awaited

**Bug-Fixing Plan**:

## Steps

- **Step 1**: Validate Baseline
- **Step 2**: Write Focused Tests for storage.ts async handling
- **Step 3**: Confirm Test Failure for storage.ts
- **Step 4**: Fix Code for storage.ts
- **Step 5**: Verify Fix for storage.ts
- **Step 6**: Clean Up Unused Code for storage.ts
- **Step 7**: Clean Up Tests for storage.ts
- **Step 8**: Verify Cleanup for storage.ts
- **Step 9**: Validate Linting, Formatting and Type Checking for storage.ts
- **Step 10**: Write Focused Tests for database.service.ts
- **Step 11**: Confirm Test Failure for database.service.ts
- **Step 12**: Fix Code for database.service.ts
- **Step 13**: Verify Fix for database.service.ts
- **Step 14**: Clean Up Unused Code for database.service.ts
- **Step 15**: Clean Up Tests for database.service.ts
- **Step 16**: Verify Cleanup for database.service.ts
- **Step 17**: Validate Linting, Formatting and Type Checking for database.service.ts
- **Step 18**: Validate Quality

## Key Characteristics

- **Complexity**: Complex (multiple files, async handling)
- **Approach**: Full TDD cycle for each affected file
- **Focus**: Data persistence, async/await correctness, transaction handling
- **Test Coverage**: Persistence scenarios, refresh simulation, error handling
