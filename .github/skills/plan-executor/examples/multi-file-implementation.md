# Example: Multi-File Feature Implementation

**Scenario**: Plan has 15 steps across 4 files (database, service, component, tests)

**Execution**:
1. Initialize todo list with all 15 steps
2. Execute Steps 1-4 (database changes), update statuses
3. Provide update: "Completed database layer (4/15 steps)"
4. Execute Steps 5-8 (service changes), update statuses
5. Provide update: "Completed service layer (8/15 steps)"
6. Execute Steps 9-12 (component changes), update statuses
7. Provide update: "Completed component updates (12/15 steps)"
8. Execute Steps 13-15 (integration tests and validation)
9. Final summary with all changes documented

**Key Points**: Progress reported at logical phase boundaries; status continuously updated.
