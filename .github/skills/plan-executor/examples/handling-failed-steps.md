# Example: Handling Failed Steps

**Scenario**: Step 4 (Verify Tests Pass) fails due to unexpected test failures

**Execution**:
1. Steps 1-3 completed successfully
2. Mark Step 4 as in-progress, run tests
3. Tests fail—document the error: "3 tests failing in utils.test.ts due to type mismatches"
4. Analyze root cause: refactored code changed function signatures
5. Fix the issues in the code and update tests accordingly
6. Re-run tests until they pass
7. Mark Step 4 as completed
8. Continue with Step 5

**Key Points**: Never skip failed validation; address issues immediately; document and resolve errors.
