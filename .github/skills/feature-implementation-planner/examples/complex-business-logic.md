# Example: Complex Business Logic

**Use Case**: When implementing sophisticated algorithms or complex business rules that require rigorous testing and validation.

**Scenario**: Implement spaced repetition algorithm for problem scheduling

## Implementation Plan (Full TDD - Complex logic requires rigorous testing)

**Steps:**
- Step 1: Validate Baseline
- Step 2-11: Full TDD cycle for algorithm core (calculate next review date)
  - Step 2: Write Tests for date calculation logic
  - Step 3: Confirm Test Failure
  - Step 4: Implement core algorithm
  - Step 5: Verify Tests Pass
  - Step 6: Refactor algorithm for clarity
  - Step 7: Validate Refactoring
  - Step 8: Clean Up unused code
  - Step 9: Clean Up Tests
  - Step 10: Verify Cleanup
  - Step 11: Validate Quality
- Step 12-21: Full TDD cycle for integration with problem service
  - Step 12: Write Tests for service integration
  - Step 13: Confirm Test Failure
  - Step 14: Integrate algorithm with problem service
  - Step 15: Verify Tests Pass
  - Step 16: Refactor service methods
  - Step 17: Validate Refactoring
  - Step 18: Clean Up unused code
  - Step 19: Clean Up Tests
  - Step 20: Verify Cleanup
  - Step 21: Validate Quality
- Step 22-31: Full TDD cycle for UI integration and state management
  - Step 22: Write Tests for UI state updates
  - Step 23: Confirm Test Failure
  - Step 24: Implement UI integration
  - Step 25: Verify Tests Pass
  - Step 26: Refactor state management
  - Step 27: Validate Refactoring
  - Step 28: Clean Up unused code
  - Step 29: Clean Up Tests
  - Step 30: Verify Cleanup
  - Step 31: Validate Quality
- Step 32: Final Validation (comprehensive test run)

## Key Characteristics

- **Complexity**: High - sophisticated algorithm with multiple integration points
- **TDD Approach**: Full cycle for each major component
- **Testing Strategy**: Comprehensive coverage of edge cases, boundary conditions, and integration scenarios
- **Total Steps**: 32 steps - demonstrates complete TDD discipline for complex features
- **Separation**: Clear phases for algorithm core, service integration, and UI integration

## When to Use This Pattern

Use this full TDD approach when:
- Implementing complex algorithms or business logic
- Working with critical features that impact data integrity
- The feature involves multiple integration points
- Edge cases and error handling are crucial
- The logic will be difficult to debug if not properly tested upfront
