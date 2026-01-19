# Example: Simple Logic Bug Fix

**Scenario**: Timer shows incorrect time after pause/resume

**Root Cause**: Timestamp not updated on resume

**Bug-Fixing Plan**:

## Steps

- **Step 1**: Validate Baseline (run tests, lint, type-check)
- **Step 2**: Write Tests for pause/resume timing behavior
- **Step 3**: Confirm Test Failure
- **Step 4**: Fix timestamp update logic in SessionTimer
- **Step 5**: Verify Tests Pass
- **Step 6**: Clean Up Unused Code
- **Step 7**: Clean Up Tests
- **Step 8**: Verify Cleanup
- **Step 9**: Validate Quality (lint, format, type-check)

## Key Characteristics

- **Complexity**: Simple
- **Approach**: Full TDD cycle
- **Focus**: Logic correctness and timing behavior
- **Test Coverage**: Pause/resume scenarios and edge cases
