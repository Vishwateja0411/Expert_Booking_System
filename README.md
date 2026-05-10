# Real-Time Expert Session Booking System

A full-stack expert session booking application built with React, Node.js, Express, MongoDB Atlas, and Socket.io.

## Live Deployment

- Frontend: https://expert-booking-system-ddfx.vercel.app
- Backend API: https://expert-booking-system-1-le9t.onrender.com
- Health Check: https://expert-booking-system-1-le9t.onrender.com/api/health

> The backend is hosted on Render free tier, so the first request may take a few seconds if the service was inactive.

## Tech Stack

- Frontend: React, Vite, Socket.io Client, CSS
- Backend: Node.js, Express.js, Socket.io
- Database: MongoDB Atlas with Mongoose
- Validation: Zod
- Deployment: Vercel for frontend, Render for backend

## Features

- Expert listing with name, category, experience, and rating
- Search experts by name
- Filter experts by category
- Pagination support
- Loading, empty, success, and error states
- Expert detail view with slots grouped by date
- Real-time slot updates using Socket.io
- Booking form with validation
- Booked slots are disabled
- My Bookings screen with email-based lookup
- Booking status support: Pending, Confirmed, Completed
- Double-booking prevention using a MongoDB unique compound index
- Backend organized using routes, controllers, models, middleware, config, and seed folders

## Project Structure

```text
Expert_Booking_System/
|-- client/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- api.js
|   |   |-- main.jsx
|   |   `-- styles.css
|   `-- package.json
|
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seed/
|   |   |-- app.js
|   |   `-- server.js
|   `-- package.json
|
|-- package.json
|-- vercel.json
`-- docker-compose.yml
```

## Local Setup

### 1. Clone The Repository

```bash
git clone https://github.com/Vishwateja0411/Expert_Booking_System.git
cd Expert_Booking_System
```

### 2. Install Dependencies

```bash
npm install
```

This project uses npm workspaces for `client` and `server`.

### 3. Configure Backend Environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expert_booking?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Do not commit `.env` to GitHub.

### 4. Run Locally

```bash
npm run dev
```

Open:

- Frontend: http://127.0.0.1:5173
- Backend Health: http://localhost:5000/api/health
- Experts API: http://localhost:5000/api/experts

The backend automatically seeds sample experts when the experts collection is empty.

## API Endpoints

### Experts

```http
GET /api/experts?page=1&limit=6&search=&category=
GET /api/experts/:id
```

### Bookings

```http
POST /api/bookings
GET /api/bookings?email=user@example.com
PATCH /api/bookings/:id/status
```

## Booking Request Example

```json
{
  "expertId": "EXPERT_ID",
  "customerName": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "date": "2026-05-10",
  "timeSlot": "09:00 AM",
  "notes": "Need career guidance"
}
```

## Double Booking Prevention

Double booking is prevented at the database level using a unique compound index in the Booking model:

```js
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true }
);
```

This ensures the same expert, date, and time slot cannot be booked more than once, even if two users submit at the same time.

## Real-Time Slot Updates

Socket.io is used for real-time updates.

- The frontend joins a room for the selected expert.
- When a booking is created, the backend emits a `slotBooked` event.
- All users viewing that expert immediately see the slot disabled.

## Deployment Notes

### Backend On Render

Render settings:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Render environment variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/expert_booking?retryWrites=true&w=majority
CLIENT_ORIGIN=https://expert-booking-system-ddfx.vercel.app
```

### Frontend On Vercel

Vercel environment variables:

```env
VITE_API_BASE_URL=https://expert-booking-system-1-le9t.onrender.com/api
VITE_SOCKET_URL=https://expert-booking-system-1-le9t.onrender.com
```

After adding environment variables, redeploy the Vercel project.

## Scripts

```bash
npm run dev      # Run frontend and backend locally
npm run build    # Build the React frontend
npm start        # Start the backend server
```

