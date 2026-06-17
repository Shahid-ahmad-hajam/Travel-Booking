# ✈️ TravelBooking — Full-Stack Travel Booking Platform

A production-grade travel booking website built with **React**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🗂 Project Structure

```
travel-booking/
├── backend/                      # Express.js REST API
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, JWT
│   │   ├── flight.controller.js  # Search, CRUD
│   │   ├── hotel.controller.js   # Search, reviews, CRUD
│   │   └── booking.controller.js # Create, cancel, list
│   ├── middleware/
│   │   ├── auth.js               # JWT protect, admin guard
│   │   ├── errorHandler.js       # Global error handler
│   │   └── notFound.js           # 404 handler
│   ├── models/
│   │   ├── User.js               # User schema + bcrypt
│   │   ├── Flight.js             # Multi-segment flights
│   │   ├── Hotel.js              # Rooms, reviews, amenities
│   │   └── Booking.js            # Flight & hotel bookings
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── flight.routes.js
│   │   ├── hotel.routes.js
│   │   ├── booking.routes.js
│   │   ├── user.routes.js
│   │   └── payment.routes.js
│   ├── .env.example
│   ├── package.json
|   |---seed.js                   # To store flight and hotel data in db
│   └── server.js                 # Entry point
│
└── frontend/                     # React SPA
    └── src/
        ├── components/
        │   ├── Navbar.js / .css  # Responsive nav + auth dropdown
        │   └── Footer.js / .css  # Links + newsletter
        ├── context/
        │   └── AuthContext.js    # Global auth state
        ├── pages/
        │   ├── HomePage           # Hero, search, featured cards
        │   ├── FlightSearchPage   # Search form + popular routes
        │   ├── FlightResultsPage  # Results + filters + sort
        │   ├── HotelSearchPage    # Search + destination cards
        │   ├── HotelResultsPage   # Grid/list + sidebar filters
        │   ├── HotelDetailPage    # Gallery, rooms, reviews
        │   ├── BookingPage        # 3-step booking wizard
        │   ├── PaymentPage        # Card/PayPal/Bank form
        │   ├── BookingConfirmation# Success + reference
        │   ├── DashboardPage      # Bookings, profile, payments
        │   ├── LoginPage          # Auth form
        │   ├── RegisterPage       # Auth form
        │   └── NotFoundPage       # 404
        ├── utils/
        │   └── api.js             # Axios + auto token refresh
        ├── App.js                 # Routes + protected routes
        └── index.css              # Global design system
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                  # starts on :5000

# Frontend (new terminal)
cd frontend
npm install
npm start                    # starts on :3000
```

### 2. Environment Variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/travel_booking
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| PUT  | `/api/auth/change-password` | Change password |

### Flights
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights/search?origin=DEL&destination=DXB&departureDate=2025-06-01&cabinClass=economy&adults=1` | Search flights |
| GET | `/api/flights/popular-routes` | Popular routes |
| GET | `/api/flights/:id` | Flight details |
| POST | `/api/flights` | Create (Admin) |
| PUT | `/api/flights/:id` | Update (Admin) |
| DELETE | `/api/flights/:id` | Delete (Admin) |

### Hotels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hotels/search?city=Dubai&checkIn=2025-06-01&checkOut=2025-06-05` | Search hotels |
| GET | `/api/hotels/featured` | Featured hotels |
| GET | `/api/hotels/:id` | Hotel + rooms + reviews |
| POST | `/api/hotels/:id/reviews` | Add review (Auth) |
| POST | `/api/hotels` | Create (Admin) |

### Bookings (all require Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET  | `/api/bookings/my-bookings` | My bookings |
| GET  | `/api/bookings/:id` | Booking detail |
| GET  | `/api/bookings/reference/:ref` | By reference |
| PUT  | `/api/bookings/:id/cancel` | Cancel booking |

### Payments (all require Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/process` | Process payment |
| POST | `/api/payments/refund` | Request refund |
| GET  | `/api/payments/history` | Payment history |

---

## 🎨 Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home — hero, search widget, featured | Public |
| `/flights` | Flight search form | Public |
| `/flights/results` | Flight results + filters | Public |
| `/hotels` | Hotel search + destinations | Public |
| `/hotels/results` | Hotel grid/list + filters | Public |
| `/hotels/:id` | Hotel detail, rooms, reviews | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/booking/:type/:id` | 3-step booking wizard | 🔒 Auth |
| `/payment/:bookingId` | Payment form | 🔒 Auth |
| `/booking/confirmation/:ref` | Confirmation | 🔒 Auth |
| `/dashboard` | My bookings, profile, payments | 🔒 Auth |

---

## 🛡️ Security Features

- **JWT** access + refresh token rotation
- **bcrypt** password hashing (12 rounds)
- **Helmet** HTTP security headers
- **CORS** — restricted to frontend origin
- **Rate limiting** — 200 req/15min global, 20/15min on auth
- **Input validation** via express-validator
- **MongoDB injection** protection via Mongoose
- **Protected routes** on frontend via `ProtectedRoute` HOC

---

## 🗃️ Database Models

### User
Fields: firstName, lastName, email, password (hashed), phone, nationality, passportNumber, role (user/admin), savedFlights[], savedHotels[], preferences {currency, language, seatPreference}, refreshToken

### Flight
Fields: segments[] {airline, flightNumber, departure, arrival}, stops, totalDuration, cabinClasses[] {class, price, seatsAvailable, baggage}, origin, destination, departureDate, status, tags[]

### Hotel
Fields: name, starRating, guestRating, location {city, country, coordinates}, images, amenities {general, dining, wellness}, policies {checkIn, checkOut, cancellation}, rooms[], reviews[], featured

### Booking
Fields: bookingReference (auto-generated TB + 8 chars), user, bookingType (flight/hotel/package), flight/hotel refs, passengers[]/guests[], pricing {basePrice, taxes, fees, totalPrice}, payment {method, status, transactionId}, status, contactEmail

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| State | React Context (Auth), local useState |
| Styling | Custom CSS with CSS Variables design system |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (access + refresh), bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Dev Tools | nodemon, morgan |

---

## 📦 Extending the Project

- **Flight API**: Integrate Amadeus or Skyscanner API for live data
- **Hotels API**: Integrate Booking.com or Hotels.com API
- **Maps**: Add Google Maps for hotel location display
- **Admin Panel**: Add `/admin` dashboard for managing flights/hotels
- **Push Notifications**: FCM for booking status updates
- **Redis**: Cache popular search results
- **Docker**: Containerize with docker-compose for easy deployment