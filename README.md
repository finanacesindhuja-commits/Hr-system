# Staff Attendance & Live Tracking Portal

## Setup Instructions

### 1. Database (Supabase)
1. Login to your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Open the **SQL Editor** and paste the contents of `supabase_schema.sql` (found in the root directory) to create the necessary tables.
4. Go to **Project Settings > API** and copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. Backend Config
1. Navigate to the `server/` directory.
2. Open `.env` and paste your Supabase credentials:
   ```env
   SUPABASE_URL=your_url_here
   SUPABASE_ANON_KEY=your_key_here
   ```
3. Run `npm install` and then `npm start`.

### 3. Frontend Config
1. Navigate to the `client/` directory.
2. Run `npm install` and then `npm run dev`.

## Features
- **Secure Auth**: Login with Staff ID. Forced password change on first login.
- **Premium UI**: Dark mode with glassmorphism and smooth animations.
- **Check-In/Out**: One-tap attendance with Geolocation.
- **Hidden Tracking**: Background location updates sent via Socket.io.
- **Sidebar Modals**: Manage profile, view holidays, and terms.
- **History**: Full log of past attendance records.
