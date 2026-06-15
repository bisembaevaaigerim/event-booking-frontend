# Event Booking — Frontend

A React-based frontend for an event booking platform. Users can browse events, book tickets, leave ratings and reviews, and manage their bookings. Admins get a dedicated panel to create, edit, and remove events.

## Features

- **Event catalog** — browse upcoming events with live ticket availability
- **Authentication** — JWT-based login and registration, with automatic redirect to login on session expiry
- **Ticket booking** — book tickets for events and view or cancel your bookings
- **Ratings & reviews** — rate events (1–5 stars) and read other users' reviews, with an average rating per event
- **Admin panel** — create, edit, and delete events (role-protected route, accessible only to admins)
- **Protected routes** — private pages accessible only to authenticated users

## Tech Stack

- **React 18** + **Vite** — development and build tooling
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Axios** — API client with interceptors for attaching the auth token and handling 401 responses
- **Docker + Nginx** — containerized production build, with `/api` requests proxied to the backend

## Project Structure

```
src/
├── api/           # Axios client configuration
├── components/    # Reusable components (Navbar, PrivateRoute)
├── context/       # Auth context and state
├── pages/         # Route-level pages
│   ├── Events.jsx       # Event catalog
│   ├── EventDetail.jsx  # Event details, booking, ratings & reviews
│   ├── MyBookings.jsx    # User's bookings
│   ├── Login.jsx / Register.jsx
│   └── AdminPanel.jsx   # Event management (admin only)
├── App.jsx        # Route definitions
└── main.jsx       # App entry point
```

## Getting Started

### Prerequisites

- Node.js 20+

### Local development

```bash
git clone https://github.com/bisembaevaaigerim/event-booking-frontend.git
cd event-booking-frontend
npm install
npm run dev
```

The app expects a backend API available at `/api` (see `nginx.conf` for the production proxy setup).

### Build for production

```bash
npm run build
npm run preview
```

### Run with Docker

```bash
docker build -t event-booking-frontend .
docker run -p 80:80 event-booking-frontend
```

The image builds the app with Vite and serves the static files via Nginx, proxying `/api` requests to the backend service.

## Backend

This frontend is built to work with a REST API exposing endpoints such as `/login`, `/register`, `/events`, `/events/:id/reviews`, and `/bookings`.

## License

This project was created for educational and portfolio purposes.
