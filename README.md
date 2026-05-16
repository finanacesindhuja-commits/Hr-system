# Staff Attendance & Live Tracking Portal

## Setup Instructions

### 1. Initial Setup
1. Run `npm run install-all` in the root directory to install all dependencies for both client and server.

### 2. Configuration
1. **Server**: Copy `server/.env.example` to `server/.env` and fill in your Supabase and Email credentials.
2. **Client**: Copy `client/.env.example` to `client/.env` and ensure `VITE_API_URL` is set to `http://localhost:5001` for local development.

### 3. Running Locally
1. Run `npm run dev` in the root directory.
   - This will start the backend on port 5001.
   - This will start the frontend on its default Vite port (usually 5173).

### 4. Pushing to Production
1. Ensure your `.env` files are **NOT** pushed to Git (they are ignored by `.gitignore`).
2. Update `client/.env` to point `VITE_API_URL` to your production backend URL.
3. Deploy the `server` folder to a service like Render/Heroku and `client` to Vercel/Netlify.

## Features
- **Secure Auth**: Login with Staff ID. Forced password change on first login.
- **Premium UI**: Dark mode with glassmorphism and smooth animations.
- **Check-In/Out**: One-tap attendance with Geolocation.
- **Hidden Tracking**: Background location updates sent via Socket.io.
- **Sidebar Modals**: Manage profile, view holidays, and terms.
- **History**: Full log of past attendance records.
