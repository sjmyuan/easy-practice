# Hook Extraction Example

## Objective
Extract session management logic into useSession hook

## Refactoring Plan

### Steps
- Step 1: Validate Baseline
- Step 2-9: Full TDD cycle for useSession hook creation
  - Step 2: Write Focused Tests for useSession hook
  - Step 3: Confirm Test Failure
  - Step 4: Implement useSession hook
  - Step 5: Verify Tests Pass
  - Step 6: Clean Up Unused Code
  - Step 7: Clean Up Tests
  - Step 8: Verify Cleanup
  - Step 9: Validate Quality (lint, format, type-check)
- Step 10-17: Full TDD cycle for integrating hook into components
  - Step 10: Write Focused Tests for component integration
  - Step 11: Confirm Test Failure
  - Step 12: Integrate hook into components
  - Step 13: Verify Tests Pass
  - Step 14: Clean Up Unused Code
  - Step 15: Clean Up Tests
  - Step 16: Verify Cleanup
  - Step 17: Validate Quality
- Step 18: Final validation across all changes

### Notes
This example demonstrates the full TDD cycle for complex logic changes. The hook extraction requires comprehensive testing at both the hook level and the integration level.
