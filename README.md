# VHorizon Properties

A modern Real Estate platform built with React, Vite, and Supabase.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd vhorizonproperties
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
    VITE_GA_MEASUREMENT_ID=your_ga_id (optional)
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🏗 Architecture & Design

### Technology Stack
- **Frontend**: React (TypeScript), Vite
- **Styling**: Tailwind CSS, shadcn-ui (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router DOM v6

### Key Design Decisions

#### 1. Robust Authentication & Data Fetching
We implement a "Fresh Client" pattern to avoid deadlocks that can happen with the global Supabase client in certain authenticated states.

- **Global Client (`src/integrations/supabase/client.ts`)**: used for public queries and initial auth triggers. Configured with `detectSessionInUrl: false` to prevent race conditions.
- **Fresh Client (used in `useProperties` & Dashboard)**: For verified data fetching, we instantiate a new lightweight client per request, manually passing the session token. This ensures data loads reliably even if the global client state freezes.
- **Optimistic UI**: Sign Out and Auth State changes are applied instantly to the UI while the server request completes in the background.

#### 2. Project Structure
| Path | Description |
|------|-------------|
| `src/pages` | Main route components (Index, Dashboard, PropertyDetail) |
| `src/components` | Reusable UI blocks (PropertyCard, AuthGate, Layout) |
| `src/hooks` | Logic encapsulation (useProperties, useAuth, usePropertyFilters) |
| `src/contexts` | Global state providers (AuthContext) |
| `scripts` | Utility scripts for manual DB verification |

---

## 🛠 Features

- **Advanced Property Search**: Filter by location, price, type, amenities.
- **User Dashboard**: Manage posted requirements and saved properties.
- **Secure Auth**: Google OAuth & Email/Password login.
- **Performance**: Infinite scrolling, image optimization, and caching.

---

## ⚠️ Troubleshooting

### Infinite Loading / Spinner (Property Lists)
If properties don't load:
1.  **Check Console**: Any red errors?
2.  **Clear Site Data**: Go to DevTools -> Application -> Storage -> Clear Site Data.
3.  **Network**: Ensure `rest/v1/properties` returns 200 OK.

### "Auth taking too long"
This usually happens on slow connections or if the callback is blocked.
- The app has a **15s safety timeout**. If it hits, retry the login.
- Ensure your `VITE_SUPABASE_URL` is whitelisted in your Supabase Auth settings.

### Database Connection
You can verify direct DB connectivity by running:
```bash
node scripts/check_tables.js
```
(Note: Update the script with valid credentials before running).
