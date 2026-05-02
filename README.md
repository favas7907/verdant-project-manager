# Verdant Project Manager

A premium, modern, and highly usable project management SaaS platform, built for teams that demand precision, clarity, and exceptional UI/UX.

## 🌟 Overview
Verdant Project Manager transforms the way you manage workflows. Designed with a deep focus on aesthetic polish, seamless interaction, and rigid data consistency, Verdant provides an elite Kanban-style project management experience wrapped in a light Google Stitch-inspired visual style.

No dark mode noise. No cluttered backgrounds. Just clean, airy, and powerful project management.

## 🚀 Key Features
- **Project Workspaces:** Unlimited Kanban boards with customizable lifecycles.
- **Task Management:** Real-time drag-and-drop workflow transitions (Todo → In Progress → Done).
- **Intelligent Roles:** Project-specific roles (Admin, Manager, Team Member) ensuring fine-grained access.
- **Contextual Notifications:** Instant tracking of task assignments and automated unread states.
- **Premium Analytics:** Real-time insights, interactive velocity charting, and status distributions utilizing precise Firestore querying.
- **Collaborative Comments:** Thread-like, timestamped commenting system attached seamlessly to individual tasks.
- **Integrated Storage:** Cloud file attachments embedded directly into the task dialogs.
- **Modern Authentication:** Secure Firebase Auth system with complete user session mapping.

## 🛠 Tech Stack
- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS, layout variables (Headless structure)
- **UI Components:** Customized Shadcn/ui & Radix primitives, Lucide Icons, Recharts, @dnd-kit
- **Backend / DB / Auth:** Firebase Authentication, Cloud Firestore (Enterprise Zero-Trust structured logic), Firebase Storage
- **Deployment Strategy:** Vercel

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd project-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root folder with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## 🚀 Deployment Instructions
The application is pre-configured to be deployed natively on Vercel.

1. Publish your code to a GitHub repository.
2. Link the repository to your Vercel account.
3. Import the project using `Vite` as the framework preset.
4. Input the identical Environment Variables defined above into the Vercel deploy configuration under `Settings > Environment Variables`.
5. Deploy.

*Note on Rules:* Before full release, ensure Firestore rules matching this project’s authentication logic are securely deployed within the Firebase Console to maintain relational and path-variable validation constraints.
