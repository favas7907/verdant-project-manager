# Prompt Log - Verdant Project Manager

## 1. Authentication & Authorization
**Prompt:** "Build a complete authentication system using JWT and bcrypt. Include user signup, login, and role-based access control (Admin, Manager, Team Member). Create a protected route middleware for Express and a React context for auth state."
**AI Response Summary:** Generated `User` model with password hashing, `auth.controller.ts`, `auth.routes.ts`, `auth.middleware.ts`, and `AuthContext.tsx`.

## 2. Kanban Board & Tasks
**Prompt:** "Implement a Kanban board using @dnd-kit. Tasks should have title, description, status (Todo, In Progress, Done), priority, assigned user, and due date. Allow dragging tasks between columns and updating their status in the backend."
**AI Response Summary:** Created `Task` model, `task.controller.ts`, `ProjectBoard.tsx`, `KanbanColumn.tsx`, and `TaskCard.tsx`. Integrated drag-and-drop with backend persistence.

## 3. Notifications
**Prompt:** "Set up real-time notifications using Socket.io. Notify users when a task is assigned to them. Include a notification bell with a dropdown panel to view and mark notifications as read."
**AI Response Summary:** Added Socket.io to `server.ts`, created `Notification` model, notification helper, and `NotificationContext.tsx` with a `NotificationBell` component.

## 4. Dashboard & Analytics
**Prompt:** "Create a progress dashboard using Recharts. Show a pie chart for task status distribution and a line chart for task productivity over time. Include stat cards for total projects and tasks."
**AI Response Summary:** Implemented `Dashboard.tsx` with Recharts components and derived stats from the backend.

## 5. Comments & UI
**Prompt:** "Add a comment system to tasks. Style the entire application with a clean Green + White SaaS theme using Tailwind CSS and shadcn/ui. Ensure the layout is responsive."
**AI Response Summary:** Added comments to `Task` model and controller. Initialized shadcn/ui and built a professional layout with a sidebar and emerald-themed accents.

## Debugging Prompts
- "Fix: Ensure Socket.io joins user-specific rooms on connection."
- "Fix: Add 'all tasks' route for dashboard statistics calculation."
- "Fix: Update Kanban drag-over logic to handle column drops correctly."
