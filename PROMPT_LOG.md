# Prompt Log: Verdant Project Manager Refinement

This document captures the prompt-driven development history of the Verdant Project Manager upgrade.

## 1. Authentication Prompt
**Prompt Description:** "Improve the login and signup processes. Remove the confusing requirement for setting a role manually from the signup form, replacing roles strictly to project-based mapping. Give the pages a premium SaaS 'Stitch-inspired' light theme."
**Result:** Created the split-view auth layouts in `Login.tsx` and `Signup.tsx` utilizing soft gradients, explicit hierarchy, and clear messaging. Form payloads were stripped of unnecessary role properties ensuring natural integration downstream. 

## 2. Project & Task Boards Prompt
**Prompt Description:** "Refine the project board and task forms. Ensure consistent data models, clean drag-and-drop visuals, and make sure role rules apply nicely inside the project view."
**Result:** Recreated `TaskDialog.tsx` logic ensuring full synchronization during task creation (addressing the 'task failed to add' regression). Enhanced hover targets and implemented a seamless Glassmorphic layout for task editing modal without overwhelming the background. 

## 3. Notifications Prompt
**Prompt Description:** "Polishing the notification drop-down to be correctly targeted at users when a task gets assigned. Create elegant timestamp tracking and read receipts."
**Result:** Connected task assignment functions inside `TaskDialog.tsx` to automatically inject `notifications` targeting correct UID recipients natively utilizing `serverTimestamp()`. Modernized the bell toggle UI to represent unread states explicitly.

## 4. Dashboard Prompt
**Prompt Description:** "Clean up the progress dashboard. Change vague labels to meaningful wording, ensure Recharts don't shrink continuously, and strictly render active task volumes scoped exclusively per-user workspace mapping."
**Result:** Created an elastic container structure for Recharts components forcing a strict `flex-1 min-h-0` scale approach for rendering inside flex parent bounds to eradicate `width(-1)` warnings. Upgraded language to metrics like "Active Workspaces" and "In-Flight Tasks."

## 5. File Attachments & Comments Prompt
**Prompt Description:** "Finish the task overlay by providing smooth file upload UI attached logically to Firebase Storage, alongside chat-like styled comments keeping timestamps exact."
**Result:** Formatted a dual-column display inside `TaskDialog.tsx` allowing continuous discussion updates inside an independent scrolling feed adjacent to the primary metadata form. Validated Firebase Storage links allowing direct uploads onto `storageBucket`.

## 6. Debugging / Refinement Prompt (System Check)
**Prompt Description:** "Perform a data integrity pass against the firebase security rules to ensure they align cleanly with project-only member role verification. Catch logic regressions where normal members are blocked from project actions."
**Result:** Adjusted the Firestore ruleset (`firestore.rules`) completely off dependency of a global user 'role', shifting relational evaluation successfully to `memberIds` array verifications, permanently patching read/write denials and preserving deployment integrity.
