<<<<<<< HEAD
# Real-Time Expert Session Booking System

Full-stack booking app built with React, Node.js, Express, MongoDB, and Socket.io.

## Features

- Expert listing with search, category filter, pagination, loading and error states
- Expert details with slots grouped by date
- Real-time slot updates through Socket.io
- Booking form with validation and success messages
- My Bookings search by email with status display
- Double-booking prevention using a MongoDB unique compound index
- Assignment-friendly backend structure: routes, controllers, models, middleware

## Setup

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expert_booking
CLIENT_ORIGIN=http://localhost:5173
```

If MongoDB is not installed locally, start it with Docker:

```bash
docker compose up -d
```

Install dependencies:

```bash
npm.cmd install
npm.cmd run install:all
```

Run both apps:

```bash
npm.cmd run dev
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

The backend seeds sample experts automatically when the experts collection is empty.

## API

- `GET /api/experts?page=1&limit=6&search=&category=`
- `GET /api/experts/:id`
- `POST /api/bookings`
- `GET /api/bookings?email=`
- `PATCH /api/bookings/:id/status`
=======
# Expert_Booking_System
>>>>>>> 2dae8f4043cfc2f6eb5d2a8b6c3dfb5423181a67
