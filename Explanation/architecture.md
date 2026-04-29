# Farm2Fork — Technical Architecture & Stack

## Tech Stack Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Mobile** | React Native | 0.74.6 | Android native apps |
| **Navigation** | React Navigation | 6.x | Screen routing, tab bars, stack navigation |
| **State** | Zustand | 4.x | Lightweight global state (auth, listings, orders) |
| **HTTP** | Axios | 1.x | REST API calls with JWT interceptors |
| **Storage** | AsyncStorage | 1.x | Persisting auth tokens on device |
| **Backend** | Express.js | 4.x | REST API server |
| **Database** | PostgreSQL | 16 | Primary data store (users, orders, listings) |
| **Cache/Queue** | Redis | 7 | Session cache, Bull job queues |
| **ORM** | Sequelize | 6.x | Database models, migrations, queries |
| **Auth** | JWT + bcrypt | — | Token-based auth with hashed OTP |
| **SMS** | Twilio | 5.x | OTP delivery via SMS |
| **Payments** | Stripe | — | Payment intents, farmer payouts |
| **Real-time** | Socket.io | 4.x | Live order status, delivery tracking |
| **Containers** | Docker Compose | — | PostgreSQL + Redis infrastructure |

---

## Monorepo Structure

```
Farm2Fork/
├── apps/
│   ├── consumer-app/          🛒 Shopper-facing app
│   │   ├── android/           Android native project (Gradle)
│   │   ├── src/
│   │   │   ├── screens/       5 screens (Login, Browse, Detail, Orders, Profile)
│   │   │   ├── stores/        Zustand stores (auth, listings, orders)
│   │   │   └── api.js         Axios client + all API endpoints
│   │   ├── App.jsx            Root component (navigation + auth guard)
│   │   └── index.js           Entry point
│   │
│   ├── farmer-app/            👨‍🌾 Farmer-facing app
│   │   └── src/
│   │       ├── screens/       4 screens (Login, Dashboard, CreateListing, Orders)
│   │       ├── stores/
│   │       └── api.js
│   │
│   └── delivery-app/          🛵 Delivery partner app
│       └── src/
│           ├── screens/       2 screens (Login, Home with assignment management)
│           ├── stores/
│           └── api.js
│
├── backend/                   🖥️ Express.js API server
│   ├── src/
│   │   ├── controllers/       Business logic (auth, listings, orders, delivery, admin)
│   │   ├── models/            10 Sequelize models
│   │   ├── routes/            7 route modules (36 endpoints)
│   │   ├── middlewares/       Auth guard, validation, error handling, rate limiting
│   │   ├── services/          Stripe, notifications, delivery matching
│   │   ├── jobs/              Bull background jobs (basket expiry)
│   │   ├── config/            Socket.io, Firebase, DB config
│   │   └── app.js             Server entry point
│   ├── migrations/            12 Sequelize migrations
│   └── .env                   Environment config
│
├── docker-compose.yml         PostgreSQL 16 + Redis 7
└── package.json               Workspace root
```

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "Android Devices"
        C["🛒 Consumer App<br/>Browse, Order, Pay"]
        F["👨‍🌾 Farmer App<br/>Manage Listings, Process Orders"]
        D["🛵 Delivery App<br/>Accept Jobs, Navigate, Confirm"]
    end

    subgraph "Development Bridge"
        ADB["ADB Reverse<br/>USB port forwarding"]
        METRO["Metro Bundler<br/>:8081 JS hot-reload"]
    end

    subgraph "Backend Server :3000"
        API["Express.js REST API<br/>36 endpoints"]
        MW["Middleware Stack<br/>CORS · Helmet · Rate Limit · JWT Auth"]
        WS["Socket.io<br/>Real-time events"]
        BULL["Bull Queue<br/>Background jobs"]
    end

    subgraph "External Services"
        TW["Twilio<br/>SMS OTP"]
        ST["Stripe<br/>Payments"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL 16<br/>10 tables"]
        RD["Redis 7<br/>Cache + Queues"]
    end

    C & F & D --> ADB --> API
    C & F & D -.-> METRO
    API --> MW --> PG
    API --> WS
    API --> TW
    API --> ST
    BULL --> RD
    BULL --> PG
```

---

## Database Schema (10 Tables)

```mermaid
erDiagram
    users ||--o| farmer_profiles : "has one"
    users ||--o| delivery_profiles : "has one"
    users ||--o{ listings : "creates"
    users ||--o{ orders : "places"
    users ||--o{ reviews : "writes"
    listings ||--o{ orders : "ordered in"
    orders ||--o| delivery_assignments : "assigned to"
    users ||--o{ community_baskets : "creates"
    community_baskets ||--o{ basket_members : "has"
    users ||--o{ otp_sessions : "authenticates"

    users {
        uuid id PK
        string phone UK
        string name
        enum role "consumer|farmer|delivery|admin"
        string stripe_customer_id
    }

    listings {
        uuid id PK
        uuid farmer_id FK
        string title
        decimal price_per_unit
        decimal available_quantity
        enum unit "kg|g|dozen|piece|bunch|litre"
        boolean is_organic
        string pincode
    }

    orders {
        uuid id PK
        uuid consumer_id FK
        uuid listing_id FK
        decimal quantity
        decimal total_amount
        enum status "pending|confirmed|ready|picked|delivered|cancelled"
        string delivery_otp
    }
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant App as 📱 Mobile App
    participant API as 🖥️ Backend
    participant DB as 🗄️ PostgreSQL
    participant SMS as 📨 Twilio

    App->>API: POST /auth/otp/send {phone}
    API->>API: Generate 6-digit OTP
    API->>API: bcrypt.hash(otp)
    API->>DB: Store OtpSession (phone, hash, expires)
    API->>SMS: Send SMS with OTP code
    API-->>App: 200 "OTP sent"

    App->>API: POST /auth/otp/verify {phone, otp}
    API->>DB: Find latest OtpSession for phone
    API->>API: bcrypt.compare(otp, hash)
    alt User exists
        API->>DB: Find User by phone
        API->>API: jwt.sign({userId, role})
        API-->>App: 200 {token, user}
    else New user
        API-->>App: 200 {needsRegistration: true}
        App->>API: POST /auth/register {phone, name, role}
        API->>DB: Create User + role profile
        API-->>App: 201 {token, user}
    end

    Note over App: Stores token in AsyncStorage<br/>All future requests include<br/>Authorization: Bearer <token>
```

> [!NOTE]
> **Dev Mode:** OTP `123456` always works. Real Twilio SMS only fires when `NODE_ENV=production`.

---

## Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> pending: Consumer places order
    pending --> confirmed: Farmer accepts
    pending --> cancelled: Consumer/Farmer cancels
    confirmed --> ready: Farmer marks ready for pickup
    ready --> picked: Delivery partner picks up
    picked --> delivered: Delivery partner confirms with OTP
    delivered --> [*]
    cancelled --> [*]
```

| Step | Who | What Happens |
|------|-----|-------------|
| **Browse** | Consumer | Searches listings by category, pincode, organic filter |
| **Order** | Consumer | Selects quantity, creates order (Stripe payment intent) |
| **Accept** | Farmer | Sees new order on dashboard, taps "Accept" |
| **Ready** | Farmer | Packs the produce, marks "Ready for Pickup" |
| **Assign** | System | Matches nearest available delivery partner |
| **Pickup** | Delivery | Navigates to farm, picks up order |
| **Deliver** | Delivery | Navigates to consumer, confirms with delivery OTP |
| **Complete** | System | Releases payment to farmer, marks order delivered |

---

## API Endpoints (36 total)

| Module | Method | Endpoint | Auth |
|--------|--------|----------|------|
| **Auth** | POST | `/auth/otp/send` | No |
| | POST | `/auth/otp/verify` | No |
| | POST | `/auth/register` | No |
| | POST | `/auth/logout` | Yes |
| **Listings** | GET | `/listings` | No |
| | GET | `/listings/categories` | No |
| | GET | `/listings/:id` | No |
| | POST | `/listings` | Farmer |
| | PUT | `/listings/:id` | Farmer |
| | DELETE | `/listings/:id` | Farmer |
| | GET | `/listings/farmer/mine` | Farmer |
| **Orders** | POST | `/orders` | Consumer |
| | GET | `/orders/:id` | Yes |
| | GET | `/orders/consumer/mine` | Consumer |
| | GET | `/orders/farmer/mine` | Farmer |
| | PUT | `/orders/:id/accept` | Farmer |
| | PUT | `/orders/:id/ready` | Farmer |
| | PUT | `/orders/:id/cancel` | Yes |
| **Delivery** | PUT | `/delivery/availability` | Delivery |
| | GET | `/delivery/assignments` | Delivery |
| | PUT | `/delivery/assignments/:id/accept` | Delivery |
| | PUT | `/delivery/assignments/:id/pickup` | Delivery |
| | PUT | `/delivery/assignments/:id/deliver` | Delivery |
| | PUT | `/delivery/location` | Delivery |
| **Baskets** | GET | `/baskets` | No |
| | GET | `/baskets/:id` | No |
| | POST | `/baskets` | Yes |
| | POST | `/baskets/:id/join` | Yes |
| | PUT | `/baskets/:id/settle` | Yes |
| **Stripe** | POST | `/stripe/payment-intent` | Consumer |
| | POST | `/stripe/farmer/onboard` | Farmer |
| | POST | `/stripe/farmer/payout` | Farmer |
| | POST | `/stripe/webhook` | No |
| **Admin** | GET | `/admin/dashboard` | Admin |
| | GET | `/admin/users` | Admin |
| | PUT | `/admin/users/:id` | Admin |

---

## How the Pieces Connect at Runtime

```
┌─────────────────────────────────────────────┐
│  Your PC                                     │
│                                              │
│  Terminal 1: node src/app.js     (:3000)     │
│  Terminal 2: npx react-native    (:8081)     │
│       ↑ ADB reverse tcp:3000                 │
│       ↑ ADB reverse tcp:8081 (auto)          │
│       │                                      │
│  ┌────┴──────────┐  ┌───────────────────┐    │
│  │ PostgreSQL:5432│  │ Redis:6379        │    │
│  │ (Docker)      │  │ (Docker)          │    │
│  └───────────────┘  └───────────────────┘    │
└──────────────┬──────────────────────────────┘
               │ USB Cable
         ┌─────┴─────┐
         │ 📱 Phone   │
         │ Consumer   │
         │ App        │
         └───────────┘
```
