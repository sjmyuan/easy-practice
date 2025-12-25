# Project: Easy Practice for Parents

A mobile-first web application that helps parents facilitate practice for their children (ages 3-9) by generating random addition and subtraction problems within 20. The app prioritizes previously failed problems and provides simple performance tracking.

## Design Decisions

### Single Page Application (SPA) Architecture (December 29, 2025)

**Decision**: Refactored the application from a multi-page architecture to a Single Page Application (SPA) by merging the practice page functionality into the landing page, eliminating client-side navigation.

**Rationale**:

- Simplifies the application architecture by consolidating all views into a single page
- Eliminates unnecessary page transitions and routing complexity
- Improves user experience with instant view transitions via conditional rendering
- Reduces cognitive overhead by maintaining a single entry point
- Aligns with the app's simple workflow: select problem set → configure → practice → review
- Better state management with all views sharing the same React component tree
- Easier to test and maintain with fewer moving parts

**Implementation Details**:

- Merged `app/practice/page.tsx` functionality into `app/page.tsx`
- Removed all `useRouter()` and `router.push()` calls
- Implemented view selection via conditional rendering based on `state.selectedProblemSetId` and session state
- View hierarchy:
  - **LandingView**: Shown when `selectedProblemSetId === null` (problem set selection)
  - **PracticeSessionView**: Shown when `isSessionActive === true` (active practice session)
  - **SessionCompleteView**: Shown when `sessionCompletedCount > 0` (post-session results)
  - **PreSessionView**: Shown when problem set is selected but no active session (pre-session configuration)
- Extracted 6 reusable view components:
  - `ErrorView`: Centralized error display with retry functionality
  - `LoadingView`: Consistent loading state presentation
  - `LandingView`: Problem set selection interface
  - `PreSessionView`: Pre-session controls (start session, view summary, settings)
  - `SessionCompleteView`: Post-session statistics and actions
  - `PracticeSessionView`: Active session interface (timer, progress, problem display, answer buttons)
- Removed practice page directory: `app/practice/`
- Updated all navigation actions to use state changes instead of routing
- Maintained all existing functionality including settings panel, summary view, and session management

**Impact**:

- Single entry point at `/` for the entire application
- Instant view transitions without page reloads
- Simplified codebase with improved maintainability
- Better code organization with dedicated view components
- No change to user-facing functionality or behavior
- Improved testability with clearer component boundaries
- All 322 tests maintained and passing after refactor

### Settings Panel (December 20, 2025)

**Decision**: Added a settings panel accessible via a settings icon on the practice page to consolidate configuration controls, implemented as a centered modal dialog overlay.

**Rationale**:

- Declutters the main practice interface by moving infrequently used controls (Problem Coverage slider and Reset Data button) to a dedicated settings panel
- Maintains focus on the primary workflow (displaying problems and marking answers)
- Follows standard UI patterns with settings icon in top-right corner
- Provides clear separation between practice actions and configuration options
- Accessible only when no session is active, preventing accidental changes during practice
- Modal overlay pattern provides better focus and accessibility compared to side panels

**Implementation Details**:

- Settings icon (gear icon from Lucide React) positioned absolutely in top-right corner of practice page header
- Icon only visible when `isSessionActive === false` (both pre-session and post-session states)
- Clicking icon opens a centered modal dialog overlay with fade-in and scale animation
- Modal dialog:
  - Centered positioning using `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`
  - Max-width constraint: `max-w-lg` (~512px) on desktop
  - Full-screen on mobile devices: `w-full h-full` on screens smaller than `sm` breakpoint
  - Rounded corners on desktop: `sm:rounded-2xl`
  - Max height on desktop: `sm:max-h-[90vh]` with scrollable content
  - Backdrop overlay with fade-in animation
  - Fade-in with scale animation for modal appearance (`opacity-100 scale-100`)
- Modal content includes:
  - Close button (X icon) in modal header
  - Problem Coverage Slider
  - Reset Data Button
- Click on backdrop (overlay) closes the modal
- Smooth CSS transitions for fade and scale animations
- Z-index management: backdrop (z-40), modal (z-50)
- Full keyboard accessibility with proper ARIA labels and dialog role

**Impact**:

- Cleaner main interface with fewer visible controls
- Improved focus on core practice workflow with modal overlay covering the page
- Settings remain easily accessible via standard UI pattern (settings icon)
- No impact on existing functionality - all features retained, just reorganized
- Better visual hierarchy separating practice actions from configuration
- Reduced cognitive load during active practice sessions
- Enhanced mobile experience with full-screen modal on small devices
- Improved accessibility with modal dialog pattern

### Back Navigation Icon (December 20, 2025)

**Decision**: Added a back navigation icon in the practice page to replace the clickable title functionality.

**Rationale**:

- Standard UI pattern: back navigation is typically located in the top-left corner
- Improves semantic HTML structure (title is now a proper `<h1>` heading, not a button)
- Clear visual affordance with chevron-left icon
- Better separation of concerns: navigation vs. information display
- Maintains single-tap navigation while following established UX patterns

**Implementation Details**:

- Chevron-left icon (Lucide React) positioned absolutely in top-left corner
- Icon size: 32px (h-8 w-8) for clear visibility
- Hover effects: scale transform (110%) and color change to blue-600
- Smooth transitions using `transition-all` class
- ARIA label: "Back to landing page" for accessibility
- No confirmation dialog for quick navigation flow

**Impact**:

- Improved usability with standard back navigation pattern
- Better semantic HTML structure (h1 for title)
- Enhanced visual hierarchy (navigation separate from title)
- Maintains efficient workflow with single-tap back navigation
- Better accessibility with proper ARIA labels and keyboard support

### Session Timer Feature (December 20, 2025)

**Decision**: Added a real-time session timer that displays elapsed time during active practice sessions.

**Rationale**:

- Parents need to track how long practice sessions are taking to manage time effectively
- Helps maintain appropriate session lengths for young children (ages 3-9) who have limited attention spans
- Provides objective data for tracking practice patterns over time
- Complements existing session completion statistics

**Implementation Details**:

- Timer displays in HH:MM:SS format (e.g., "00:02:35")
- Positioned above the progress indicator (completed/total problems)
- Updates automatically every second during active sessions
- Only visible during active practice sessions (hidden when session is not active)
- Uses React hooks (useState, useEffect) with proper cleanup to prevent memory leaks
- Fully accessible with ARIA labels ("Session elapsed time")
- Mobile-optimized with clear, readable typography

**Impact**:

- Enhanced time awareness for parents managing practice sessions
- Better session planning based on actual duration data
- Improved UX by providing real-time feedback on session progress
- Complements session statistics displayed after completion
- No impact on existing functionality - purely additive feature

### Answer Toggle Feature (December 20, 2025)

**Decision**: Added a toggle icon in the ProblemDisplay component to show/hide the answer on demand.

**Rationale**:

- Parents need a way to quickly verify answers without having to remember them or check separately
- Particularly useful when reviewing previously struggled problems
- Default hidden state maintains the existing workflow where parents verbally present problems to children
- Toggle provides flexibility for different use cases (verification, self-paced learning, review sessions)

**Implementation Details**:

- Eye/EyeOff icon (Lucide React) positioned in top-right corner for easy access
- Answer displays below the problem with differentiated styling (smaller text, green color)
- Toggle state resets automatically when a new problem loads
- Full keyboard accessibility (Enter/Space key support) and ARIA labels
- Mobile-optimized touch targets (44px × 44px minimum)

**Impact**:

- Improved parent UX by eliminating need to mentally track or look up answers
- Maintains existing practice workflow (answer hidden by default)
- Enhanced accessibility with proper ARIA labels and keyboard support
- Supports multiple use cases: verification during practice, reviewing struggled problems, or allowing child to self-check

### Streamlined Workflow (December 20, 2025)

**Decision**: Removed the dedicated "Next Problem" button from the main interface.

**Rationale**:

- The Pass and Fail buttons in Epic 2 automatically load the next problem after marking, making a separate "Next Problem" button redundant
- Simplifies the user interface and reduces cognitive load
- Aligns with the "one-tap actions" usability need from the Busy Parent persona
- Streamlines the workflow: Display problem → Mark Pass/Fail → Next problem loads automatically

### Problem Coverage Slider (December 20, 2025)

**Decision**: Added a Problem Coverage slider to allow parents to control what percentage of problems to practice based on priority.

**Rationale**:

- Parents with limited time need to focus on the most challenging problems
- Higher-priority problems (those with more failures or higher failure rates) should be practiced more frequently
- Provides flexibility for different practice session lengths and goals
- Helps maintain engagement by preventing sessions from becoming too long

**Implementation Details**:

- Slider with discrete steps: 30%, 50%, 80%, 100% (default)
- Positioned on practice page, visible only when session is not active
- Shows real-time feedback: percentage and estimated problem count
- Coverage selection filters problems by priority (highest first)
- Coverage resets to 100% after starting a session
- Mobile-friendly with large touch targets and clear visual design

**Impact**:

- Enhanced flexibility for time-constrained practice sessions
- Focus on struggling concepts through priority-based filtering
- Improved parent control over practice scope and intensity
- Maintains full-coverage option (100%) as the default
- No impact on existing functionality when using 100% coverage

**Impact**:

- Reduced button count from 4 to 3 in main interface (Type selector buttons + View Summary + Reset Data)
- More efficient workflow with fewer clicks per problem
- NextProblemButton component retained in codebase but not used in main page flow

## Personas

### Persona: Busy Parent

- Description: A parent who wants to help their child improve math skills but has limited time to create practice problems or track progress manually.
- Goal: Save time creating math problems while focusing on areas where their child struggles, ultimately improving their child’s math skills.
- Pain Points:
  - Spending too much time creating practice problems.
  - Difficulty identifying and focusing on the child’s weak areas.
  - Needing a quick and easy way to track performance without direct input from the child.
- Usability Needs:
  - A simple, distraction-free interface with one-tap actions for generating problems and marking results.
  - Fast loading times and seamless mobile-first experience.
  - Visual engagement for the child, even though they won’t interact directly with the app.
- Role: Primary caregiver responsible for facilitating practice.

## Epics

### Epic 1: Parent-Focused Problem Generator ✅ COMPLETED

[Busy Parent] wants to generate math problems quickly so that they can focus on their child's weak areas and save time.

#### User Story 1: Generate Random Addition Problems ✅ COMPLETED

As a busy parent, I want to generate random addition problems within 20 so that I can verbally present them to my child for practice.

##### Acceptance Criteria:

- ✅ Given the app is opened, when the parent selects "Addition," then a random addition problem within 20 is displayed.
- ✅ Given the app generates an addition problem, when the problem is displayed, then it should always be within the range of 0 to 20.
- ✅ Given the app generates an addition problem, when the same problem is generated consecutively, then the system should avoid repetition unless all problems have been used.

#### User Story 2: Generate Random Subtraction Problems ✅ COMPLETED

As a busy parent, I want to generate random subtraction problems within 20 so that I can verbally present them to my child for practice.

##### Acceptance Criteria:

- ✅ Given the app is opened, when the parent selects "Subtraction," then a random subtraction problem within 20 is displayed.
- ✅ Given the app generates a subtraction problem, when the problem is displayed, then the result should never be negative.
- ✅ Given the app generates a subtraction problem, when the same problem is generated consecutively, then the system should avoid repetition unless all problems have been used.

#### User Story 3: Prioritize Previously Failed Problems ✅ COMPLETED

As a busy parent, I want the system to prioritize previously failed problems so that I can help my child focus on areas needing improvement.

##### Acceptance Criteria:

- ✅ Given the parent marks a problem as failed, when generating new problems, then the failed problem should appear more frequently.
- ✅ Given the parent marks all problems as passed, when generating new problems, then the system should reset prioritization and generate random problems.
- ✅ Given there are no previously failed problems, when generating new problems, then the system should generate random problems without prioritization.

#### User Story 4: Display Current Math Problem Clearly ✅ COMPLETED

As a busy parent, I want a simple display of the current math problem (e.g., "5 + 7") so that I can easily read it aloud to my child.

##### Acceptance Criteria:

- ✅ Given a math problem is generated, when it is displayed, then the text size should be large enough to read easily on a mobile device.
- ✅ Given a math problem is displayed, when the parent interacts with the app, then the problem text should remain visible without overlapping other UI elements.
- ✅ Given a math problem is displayed, when the app is rotated (portrait to landscape), then the problem text should adjust to fit the screen.

### Epic 2: Simple Performance Tracking ✅ COMPLETED

[Busy Parent] wants to track their child's performance easily so that they can identify weak areas and monitor improvement.

#### User Story 1: Mark Problems as Passed or Failed ✅ COMPLETED

As a busy parent, I want to quickly mark each problem as passed or failed so that I can track my child’s progress.

##### Acceptance Criteria:

- ✅ Given a math problem is displayed, when the parent taps "Pass," then the problem is marked as passed and stored locally.
- ✅ Given a math problem is displayed, when the parent taps "Fail," then the problem is marked as failed and stored locally.
- ✅ Given the parent marks a problem, when the next problem is generated, then the previous problem's status should persist.

#### User Story 2: View Summary of Struggled Problems ✅ COMPLETED

As a busy parent, I want to see a summary of which problems my child has struggled with so that I can focus on those areas during future practice sessions.

##### Acceptance Criteria:

- ✅ Given the parent marks problems as failed, when viewing the summary, then the list of struggled problems should be displayed.
- ✅ Given there are no failed problems, when viewing the summary, then the app should display a message like "No struggled problems found."
- ✅ Given the parent views the summary, when they tap on a specific problem, then the app should highlight its details (e.g., frequency of failure).

#### User Story 3: Reset Performance Data ✅ COMPLETED

As a busy parent, I want to reset or clear performance data periodically so that I can reassess my child's skills.

##### Acceptance Criteria:

- ✅ Given performance data exists, when the parent taps "Reset Data," then all stored data for the currently selected problem type should be cleared.
- ✅ Given performance data is cleared for a problem type, when the parent views the summary, then only problems from other types should remain.
- ✅ Given the parent resets data for a problem type, when new problems of that type are generated, then the system should start tracking performance from scratch for that type.
- ✅ Given the parent resets addition data, when they switch to subtraction, then subtraction performance data should remain intact.

### Epic 3: Mobile-First Design (Parent-Centric) ✅ COMPLETED

[Busy Parent] wants a mobile-first, distraction-free interface so that they can use the app conveniently during short practice sessions.

#### User Story 1: Responsive Design for Mobile Devices ✅ COMPLETED

As a busy parent, I want the application to work seamlessly on my mobile device so that I can use it anywhere.

##### Acceptance Criteria:

- ✅ Given the app is opened on a mobile device, when viewed in portrait mode, then all UI elements should fit within the screen without scrolling.
- ✅ Given the app is opened on a mobile device, when rotated to landscape mode, then the layout should adjust dynamically without breaking.
- ✅ Given the app is opened on different screen sizes, when viewed, then the design should remain consistent and usable.

#### User Story 2: Large Text and Buttons for Ease of Use ✅ COMPLETED

As a busy parent, I want the interface to have large text/buttons so that I can easily interact with the app while managing my child's practice.

##### Acceptance Criteria:

- ✅ Given the app is opened, when buttons or text are displayed, then their size should be at least 16px for readability.
- ✅ Given the app is used on a small screen, when buttons are tapped, then they should have sufficient padding to prevent accidental taps.
- ✅ Given the app is used in low-light conditions, when text is displayed, then it should have sufficient contrast against the background.

#### User Story 3: Engaging Visuals for Child Engagement ✅ COMPLETED

As a busy parent, I want the design to include engaging visuals (e.g., colors, illustrations) so that my child remains interested during practice, even though they aren't directly using the app.

##### Acceptance Criteria:

- ✅ Given the app is opened, when displayed, then the interface should include colorful visuals (e.g., illustrations, animations).
- ✅ Given the app includes visuals, when viewed by the child, then the visuals should not distract from the parent's ability to interact with the app.
- ✅ Given the app is used repeatedly, when visuals are displayed, then they should remain engaging without becoming repetitive.

### Epic 4: Session-Based Practice with Progress Tracking ✅ COMPLETED

[Busy Parent] wants to track progress through a defined set of problems so that they know when the practice session is complete and can see how many problems their child has worked through.

#### User Story 1: Start Practice Sessions ✅ COMPLETED

As a busy parent, I want to explicitly start a new practice session so that I have control over when practice begins.

##### Acceptance Criteria:

- ✅ Given the app is initialized, when I view the main screen, then I should see a "Start New Session" button.
- ✅ Given I tap "Start New Session," when the session starts, then a set of problems should be generated based on my child's performance history.
- ✅ Given there are no enabled problem sets, when I tap "Start New Session," then the app should display a message indicating no problems are available.

#### User Story 2: Problem Selection with Randomization ✅ COMPLETED

As a busy parent, I want all problems from the selected problem set to be included in each session so that my child practices the complete set.

##### Acceptance Criteria:

- ✅ Given a session is started, when generating the problem queue, then all problems from enabled problem sets should be included.
- ✅ Given a session is generated, when problems are presented, then they should appear in random order with no duplicates.

#### User Story 2.1: Problem Coverage Selection ✅ COMPLETED

As a busy parent, I want to control what percentage of problems my child practices based on difficulty, so I can focus on the most challenging problems when time is limited.

##### Acceptance Criteria:

- ✅ Given I am on the practice page before starting a session, when viewing the interface, then I should see a Problem Coverage slider with preset values (30%, 50%, 80%, 100%).
- ✅ Given I adjust the Problem Coverage slider, when I change the value, then I should see the selected percentage and the estimated number of problems to be practiced.
- ✅ Given I set the Problem Coverage to less than 100%, when the session starts, then only the top X% of problems sorted by priority (highest priority first) should be included in the session.
- ✅ Given I set the Problem Coverage to 100%, when the session starts, then all problems should be included as before.
- ✅ Given I start a session with a coverage value, when the session starts, then the coverage should reset to 100% for the next session.
- ✅ Given a session is active, when viewing the interface, then the Problem Coverage slider should not be visible.

#### User Story 3: Track Session Progress ✅ COMPLETED

As a busy parent, I want to see how many problems have been completed in the current session so that I know how much progress we've made.

##### Acceptance Criteria:

- ✅ Given a session is active, when viewing the problem, then I should see a progress indicator showing "X / Y" (e.g., "5 / 20") near the problem display.
- ✅ Given I mark a problem as pass or fail, when the answer is submitted, then the progress indicator should increment the completed count.
- ✅ Given the session reaches the last problem, when I submit an answer, then the session should complete.

#### User Story 4: Session Completion Feedback ✅ COMPLETED

As a busy parent, I want clear feedback when a session is complete so that I know we can take a break or start a new session.

##### Acceptance Criteria:

- ✅ Given all problems in a session are completed, when the last answer is submitted, then the app should display a "Session Complete" message.
- ✅ Given the session is complete, when viewing the completion screen, then I should see how many problems were completed.
- ✅ Given the session is complete, when I want to continue, then I should be able to tap "Start New Session" to begin a new practice session.

#### User Story 5: Session Reset on Type Switch ✅ COMPLETED

As a busy parent, I want sessions to reset when I switch between addition and subtraction so that each type has its own practice flow.

##### Acceptance Criteria:

- ✅ Given I am in an active session, when I switch from addition to subtraction (or vice versa), then the current session should be cleared.
- ✅ Given I switch types, when viewing the screen, then I should see the "Start New Session" button to begin a new session for that type.
- ✅ Given I switch types, when I start a new session, then the problems should be from the newly selected type.

#### User Story 6: Session Completion Statistics ✅ COMPLETED

As a busy parent, I want to see detailed statistics when a session completes so that I can understand how my child performed and how long the session took.

##### Acceptance Criteria:

- ✅ Given all problems in a session are completed, when the completion screen is displayed, then I should see the session duration in HH:MM:SS format.
- ✅ Given the session is complete, when viewing the completion screen, then I should see the number of problems marked as "Pass".
- ✅ Given the session is complete, when viewing the completion screen, then I should see the number of problems marked as "Fail".
- ✅ Given the session is complete, when viewing the completion screen, then I should see the total number of problems completed in the session.
- ✅ Given a new session starts, when beginning the session, then the timer should start and statistics should reset to zero.
- ✅ Given a session is active, when problems are being answered, then the statistics should not be displayed until the session completes.

### Epic 5: Internationalization (i18n) Support

[Busy Parent] wants to use the app in their preferred language (Chinese or English) so that it is accessible and comfortable for parents in China and English-speaking regions.

#### User Story 1: Language Selection and Persistence

As a parent, I want to switch between Chinese and English in the app so that I can use it in my preferred language, with Chinese as the default.

##### Acceptance Criteria:

- Given the app is opened, when no language is selected, then the app displays in Chinese by default.
- Given the app is opened, when I select a language, then all user-visible elements (UI, instructions, error messages, etc.) are displayed in the selected language.
- Given I select a language, when I return to the app in the same browser, then my language preference persists across sessions.
- Given the app displays problem sets, when viewing the list, then each problem set's name and description are shown in the selected language (from JSON/manifest).
- Given the app is used, when switching languages, then the UI updates immediately to reflect the new language.
- Given translation resources are prepared, when the app is used, then all user-visible text is translated and displays correctly in both languages.

##### In Scope:

- Problem set JSON and manifest update for bilingual name/description
- Translation resource preparation for all user-visible text
- Refactoring existing UI components to support dynamic language switching
- Implementing mechanism to store language preference in browser storage

##### Out of Scope:

- Language preference does not sync across multiple devices or browsers
- Only name and description fields in problem set JSON and manifest require translation; other fields remain unchanged
- No support for additional languages beyond English and Chinese
- No automatic language detection based on browser or system settings

##### Prerequisites:

- Existing UI components must be refactored to support dynamic language switching
- Translation resources for all user-visible text in both English and Chinese must be prepared
- Problem set JSON files and manifest must be updated to include name and description in both languages
- Mechanism for storing language preference in browser storage (e.g., localStorage) must be implemented

##### Benefits:

- Parents in China can use the app comfortably in their native language
- English-speaking users can access the app in English
- Users have control over language preference, improving accessibility and user experience
- Consistent language experience for users during their session
- Problem sets and manifest are understandable in both languages, broadening usability

### Epic 6: Problem Set Selection and Navigation ✅ COMPLETED

[Busy Parent] wants to select a specific problem set before starting practice so that they can choose focused practice areas and easily switch between different problem types.

#### User Story 1: Problem Set Selection Landing Page

As a busy parent, I want a dedicated landing page where I can see and select from all available problem sets so that I can choose the specific area I want my child to practice.

##### Acceptance Criteria:

- Given the app is opened, when I visit the root URL ("/"), then I should see a list of all available problem sets.
- Given I view the problem set list, when displayed, then each problem set should show its name and description.
- Given I see the problem set options, when I select one, then the app should automatically start a session with that problem set and navigate to the practice page.
- Given I select a problem set, when the practice page loads, then the session should start automatically without requiring a "Start Session" button click.

#### User Story 2: Practice Page Navigation

As a busy parent, I want the practice interface on a separate page without the type selector so that the interface is cleaner and focused on the selected problem set.

##### Acceptance Criteria:

- Given I selected a problem set, when I'm on the practice page ("/practice"), then I should see the problem display and answer buttons without a type selector.
- Given I'm practicing problems, when I want to change the problem set, then I should see a "Change Problem Set" button that returns me to the landing page.
- Given I complete a session, when viewing the completion screen, then I should see both "Start New Session" (restarts with same set) and "Change Problem Set" (returns to landing) buttons.

#### User Story 3: Mid-Session Navigation

As a busy parent, I want the ability to return to the landing page during an active session so that I can switch to a different problem set if needed.

##### Acceptance Criteria:

- Given I am in an active practice session, when I click "Change Problem Set", then I should be navigated back to the landing page.
- Given I navigate away from an active session, when I return to the landing page, then the session should be cleared.
- Given I select a new problem set after leaving a session, when starting the new session, then it should be independent of the previous session.

#### User Story 4: Session Restart with Same Problem Set

As a busy parent, I want to quickly restart a new session with the same problem set after completion so that I can continue practicing the same area without reselecting.

##### Acceptance Criteria:

- Given I completed a session, when I click "Start New Session", then a new session should start with the same problem set.
- Given I start a new session with the same set, when problems are loaded, then they should be generated using the updated performance data from the previous session.
- Given I start a new session, when viewing the practice page, then the progress indicator should reset to show the new session's progress (e.g., "1 / 15").

### Feature: Versioned Problem Set Management ✅ COMPLETED

[System/Developers] want automatic problem set discovery and version management so that new problem sets can be added easily and updates can be deployed without data loss.

#### User Story 1: Manifest-Based Problem Set Discovery ✅ COMPLETED

As a system, I want to automatically discover all available problem sets from a manifest file so that new sets can be added without code changes.

##### Acceptance Criteria:

- ✅ Given the app initializes, when loading problem sets, then it should read from `/public/problem-sets/manifest.json`.
- ✅ Given the manifest lists problem sets, when loading, then the system should fetch and import each problem set from its specified path.
- ✅ Given a problem set file is missing or fails to load, when loading other sets, then the system should continue loading remaining sets gracefully.
- ✅ Given all problem sets are loaded, when displayed in the selector, then only successfully loaded sets should be available.
- ✅ Given a problem set previously imported is no longer present in the manifest, when loading defaults, then the system should remove that problem set and all its associated problems, statistics, and attempts from the local database.

#### User Story 2: Version-Based Import Control ✅ COMPLETED

As a system, I want to check problem set versions before importing so that I can prevent duplicate imports and ensure only newer versions are loaded.

##### Acceptance Criteria:

- ✅ Given a problem set is being imported, when checking for existing data, then the system should compare version numbers using semantic versioning.
- ✅ Given a problem set with the same version exists, when attempting import, then the system should skip the import.
- ✅ Given a problem set with a lower version is being imported, when checking versions, then the system should skip the import.
- ✅ Given a problem set with a higher version is being imported, when checking versions, then the system should proceed with the upgrade.

#### User Story 3: Smart Problem Set Upgrades ✅ COMPLETED

As a system, I want to preserve user statistics for matching problems during upgrades so that progress is not lost when problem sets are updated.

##### Acceptance Criteria:

- ✅ Given a problem set upgrade is detected, when replacing problems, then all old problems should be deleted along with their attempts.
- ✅ Given new problems are being added, when checking for matches, then problems with identical text and answer should preserve their statistics.
- ✅ Given a problem exists in both old and new versions, when upgrading, then the statistics (attempts, passes, fails, priority) should carry over.
- ✅ Given new problems are added that don't match old ones, when importing, then they should receive fresh statistics (0 attempts, default priority).
- ✅ Given old problems are removed in the new version, when upgrading, then their statistics should be deleted permanently.

#### User Story 4: Extended Problem Set Library ✅ COMPLETED

As a busy parent, I want additional problem sets for simpler problems so that I can choose age-appropriate difficulty for my child.

##### Acceptance Criteria:

- ✅ Given the app loads, when viewing problem sets, then I should see "Addition within 10" as an option.
- ✅ Given the app loads, when viewing problem sets, then I should see "Subtraction within 10" as an option.
- ✅ Given I select "Addition within 10", when practicing, then all addition problems should have sums from 0 to 10.
- ✅ Given I select "Subtraction within 10", when practicing, then all subtraction problems should have minuends from 0 to 10 with non-negative results.

## Dependencies/Risks

- Dependency: Local data storage (e.g., browser localStorage or IndexedDB) is required for saving performance data.
- Dependency: Next.js App Router for implementing multiple routes (/, /practice).
- Risk: Technical debt could arise if features are rushed without proper testing.
- Risk: Scope creep may occur if additional features are requested mid-development.
- Risk: Changing requirements could lead to rework and delays.
- Risk: Limited availability of developers or testers could slow down progress.
