# Pages documentation

This document lists the pages in the project, a short description of each, and local run instructions.

## How to run the project locally

- Prerequisites: Node.js (16+ recommended), npm or yarn, and a Firebase project.
- Install dependencies:

```bash
npm install
# or
yarn
```

- Environment variables: create a `.env.local` in the project root with the following (values from your Firebase project):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

- Run the development server:

```bash
npm run dev
# or
yarn dev
```

- Build for production:

```bash
npm run build
npm start
# or with yarn
yarn build
yarn start
```

## Pages (overview)

Below are the pages present in the `pages/` folder and a short description of each.

- `index.js` — Public landing / entry page.
- `login.js` — Authentication page for signing in users.
- `dashboard.js` — Main dashboard page (likely redirects to role-specific dashboards).
- `artist-dashboard.js` — Dashboard view for users with an artist role.

- `role-manager.js` — Page that wraps the `RoleManager` component to add/edit roles and permissions.
- `manage-users.js` — Page that wraps the `ManageUsers` component for admin user listing and management.
- `jobs.js` — Jobs listing and management page (wraps `JobManager`).
- `departments.js` — Departments management page (wraps `DepartmentManager`).
- `teams.js` — Teams management page (wraps `TeamManager`).

- `pages/api/updateUserEmail.js` — API route used to update a user's email (server-side operation using Firebase Admin).

### Dashboards sub-pages

- `pages/dashboards/admin/index.js` — Admin dashboard with admin-specific metrics and cards.
- `pages/dashboards/artist/index.js` — Artist-specific dashboard (metrics for artists).

### Notes about components used by pages

Most pages assemble components from the `components/` folder. Key components include:

- `Sidebar.js` and `ArtistSidebar.js` — Navigation sidebars (responsive, mobile-friendly).
- `Topbar.js` — Top header with search/logout UI.
- `DashboardCard.js` — Reusable card component used on dashboards.
- Management components: `RoleManager.js`, `ManageUsers.js`, `JobManager.js`, `DepartmentManager.js`, `TeamManager.js`.
- Forms live in `components/forms/` (e.g., `RoleForm.js`, `UserForm.js`, `JobForm.js`).

## Notes and recommendations

- Firebase credentials: ensure the `.env.local` contains the `NEXT_PUBLIC_...` keys used in `lib/firebase.js`.
- If you use server-side Firebase Admin features (e.g., in `pages/api/*`), configure server-side credentials for `lib/firebaseAdmin.js` (likely via a service account JSON or environment variables).
- Test responsive behaviour by running the dev server and opening the app in a mobile viewport (browser DevTools).

---

If you'd like, I can also update the project `README.md` with these run instructions or add per-page screenshots and route examples. Tell me which pages you want expanded with API details or component mappings.
