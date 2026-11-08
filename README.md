# 💰 Ipon — Daily Savings Tracker

**Ipon** (Filipino for "savings") is a modern, mobile-first web application that helps you build a daily savings habit through gamified challenges, streak tracking, and collaborative goals.

Built with **Next.js 14**, **TypeScript**, and a beautiful pink glassmorphism UI.

---

## ✨ Features

- **Daily Savings Challenges** — Create personal savings challenges with customizable daily targets and durations
- **Collaborative Challenges** — Invite friends via shareable invite codes and save together
- **Calendar View** — Visual calendar showing your savings activity day-by-day
- **Statistics & Analytics** — Track streaks, totals, averages, and progress with interactive charts
- **Email Verification** — Secure 6-digit code verification on registration
- **Profile Image Upload** — Upload avatars to Cloudflare R2 with a 3-day cooldown to prevent spam
- **Notification Inbox** — In-app notifications for challenge invites, milestones, and reminders
- **Onboarding Tutorial** — Interactive 4-slide walkthrough for new users
- **Multi-Currency Support** — PHP (₱), USD ($), EUR (€), and more
- **Responsive Mobile-First Design** — Optimized for mobile with a bottom navigation bar
- **Loading Skeletons** — Smooth loading states across all pages
- **Password Reset** — Forgot password flow with email-based reset links
- **Cookie Consent** — GDPR-compliant cookie consent banner

---

## 🛠️ Tech Stack

### Languages

| Language | Usage |
|----------|-------|
| **TypeScript** 5.6 | Primary language for all source code |
| **CSS** | Global styles & Tailwind utilities |
| **SQL** | Database queries (via Prisma ORM) |

### Framework & Runtime

| Tool | Purpose |
|------|---------|
| [**Next.js**](https://nextjs.org/) 14 | React framework with App Router, API routes, SSR |
| [**React**](https://react.dev/) 18 | UI component library |
| [**Node.js**](https://nodejs.org/) | Server-side runtime |

### Styling

| Tool | Purpose |
|------|---------|
| [**Tailwind CSS**](https://tailwindcss.com/) 3.4 | Utility-first CSS framework |
| [**PostCSS**](https://postcss.org/) | CSS processing |
| [**Autoprefixer**](https://github.com/postcss/autoprefixer) | Vendor prefix automation |
| **Plus Jakarta Sans** | Primary font (via `next/font/google`) |
| **Glassmorphism** | Custom glass-card UI theme with backdrop blur |

### Database & ORM

| Tool | Purpose |
|------|---------|
| [**PostgreSQL**](https://www.postgresql.org/) | Relational database |
| [**Neon**](https://neon.tech/) | Serverless PostgreSQL cloud hosting |
| [**Prisma**](https://www.prisma.io/) 5.x | Type-safe ORM with migrations |

### Authentication & Security

| Tool | Purpose |
|------|---------|
| [**jsonwebtoken**](https://github.com/auth0/node-jsonwebtoken) | JWT token generation & verification |
| [**bcryptjs**](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| **HTTP-only Cookies** | Secure session management |

### Email

| Tool | Purpose |
|------|---------|
| [**Nodemailer**](https://nodemailer.com/) | Email sending (Gmail SMTP) |
| [**Mailgun.js**](https://github.com/mailgun/mailgun.js) | Fallback email provider |

### Cloud Storage

| Tool | Purpose |
|------|---------|
| [**Cloudflare R2**](https://www.cloudflare.com/products/r2/) | S3-compatible object storage for profile images |
| [**@aws-sdk/client-s3**](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/) | S3 SDK for R2 API interactions |

### Deployment & Analytics

| Tool | Purpose |
|------|---------|
| [**Vercel**](https://vercel.com/) | Hosting & CI/CD |
| [**@vercel/analytics**](https://vercel.com/analytics) | Web analytics |

### UI Libraries

| Tool | Purpose |
|------|---------|
| [**Lucide React**](https://lucide.dev/) | Icon library |
| [**canvas-confetti**](https://github.com/catdad/canvas-confetti) | Celebration confetti animations |

### Utilities

| Tool | Purpose |
|------|---------|
| [**date-fns**](https://date-fns.org/) | Date formatting & manipulation |
| [**form-data**](https://github.com/form-data/form-data) | Multipart form data handling |
| [**cross-env**](https://github.com/kentcdodds/cross-env) | Cross-platform environment variables |

### Dev Tools

| Tool | Purpose |
|------|---------|
| **TypeScript** 5.6 | Static type checking |
| **ESLint** | Code linting (via `next lint`) |
| **Prisma CLI** | Database schema management |
| **Git** | Version control |
| **npm** | Package management |

---

## 📁 Project Structure

```
Ipon/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with font & metadata
│   ├── page.tsx                  # Home / Dashboard
│   ├── loading.tsx               # Global loading skeleton
│   ├── globals.css               # Global styles & Tailwind imports
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   ├── verify/page.tsx           # Email verification page
│   ├── forgot-password/page.tsx  # Forgot password page
│   ├── reset-password/page.tsx   # Reset password page
│   ├── calendar/page.tsx         # Calendar view
│   ├── history/page.tsx          # Savings history
│   ├── inbox/page.tsx            # Notifications inbox
│   ├── join/page.tsx             # Join challenge via invite code
│   ├── settings/page.tsx         # User settings & profile
│   ├── stats/page.tsx            # Statistics & analytics
│   ├── privacy/page.tsx          # Privacy policy
│   ├── terms/page.tsx            # Terms of service
│   └── api/                      # API routes
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── me/route.ts
│       │   ├── verify/route.ts
│       │   ├── verify/resend/route.ts
│       │   ├── forgot-password/route.ts
│       │   └── reset-password/route.ts
│       ├── challenges/route.ts
│       ├── challenges/[id]/route.ts
│       ├── challenges/join/route.ts
│       ├── goals/route.ts
│       ├── goals/[id]/route.ts
│       ├── savings/route.ts
│       ├── savings/[id]/route.ts
│       ├── settings/route.ts
│       ├── stats/route.ts
│       ├── profile/avatar/route.ts
│       ├── media/[...key]/route.ts
│       └── email-preview/route.ts
├── components/                   # Reusable UI components
│   ├── Navbar.tsx
│   ├── BottomNav.tsx
│   ├── AddSavingsModal.tsx
│   ├── CreateChallengeModal.tsx
│   ├── CalendarView.tsx
│   ├── ContributorsCard.tsx
│   ├── CookieConsent.tsx
│   ├── DashboardSkeleton.tsx
│   ├── InviteCollaboratorModal.tsx
│   ├── JoinChallengeModal.tsx
│   ├── LoadingScreen.tsx
│   ├── OnboardingTutorialModal.tsx
│   └── skeletons/
│       └── PageSkeletons.tsx
├── lib/                          # Shared utilities
│   ├── auth.ts                   # JWT authentication helpers
│   ├── cache.ts                  # In-memory caching
│   ├── email-service.ts          # Email sending (Nodemailer/Mailgun)
│   ├── prisma.ts                 # Prisma client singleton
│   ├── r2.ts                     # Cloudflare R2 upload helpers
│   ├── savings-calculations.ts   # Savings math & formulas
│   ├── security.ts               # Rate limiting & security
│   └── hooks/
│       └── useDebounce.ts        # Debounce hook
├── prisma/
│   └── schema.prisma             # Database schema
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
└── package.json                  # Dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+
- **PostgreSQL** database (or a [Neon](https://neon.tech/) account)
- **Gmail** account with [App Password](https://myaccount.google.com/apppasswords) for email
- **Cloudflare R2** bucket (optional, for profile image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/neilmasion/Ipon.git
cd Ipon
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key"

# Email (Gmail SMTP)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Cloudflare R2 (optional - for profile image uploads)
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="your-bucket-name"
R2_PUBLIC_URL="https://your-r2-public-url"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with Prisma generate) |
| `npm run build` | Production build |
| `npm run start` | Start in development mode |
| `npm run start:prod` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🗄️ Database Schema

The app uses **Prisma ORM** with the following main models:

- **User** — Accounts with email verification, avatar, and settings
- **Challenge** — Savings challenges with daily targets, durations, and invite codes
- **Saving** — Individual daily savings entries linked to challenges
- **Goal** — Personal savings goals with target amounts
- **Notification** — In-app notifications (invites, milestones, reminders)
- **PasswordResetToken** — Tokens for password reset flow

---

## 🌐 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register a new account |
| `/api/auth/login` | POST | Login with email & password |
| `/api/auth/logout` | POST | Clear session cookie |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/verify` | POST | Verify email with 6-digit code |
| `/api/auth/verify/resend` | POST | Resend verification code |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/challenges` | GET, POST | List/create challenges |
| `/api/challenges/[id]` | GET, PUT, DELETE | Manage a challenge |
| `/api/challenges/join` | POST | Join via invite code |
| `/api/savings` | GET, POST | List/add savings entries |
| `/api/savings/[id]` | DELETE | Delete a savings entry |
| `/api/goals` | GET, POST | List/create goals |
| `/api/goals/[id]` | PUT, DELETE | Manage a goal |
| `/api/settings` | GET, PUT | Get/update user settings |
| `/api/stats` | GET | Get savings statistics |
| `/api/profile/avatar` | POST | Upload profile picture |
| `/api/media/[...key]` | GET | Proxy R2 media files |

---

## 🎨 Design

- **Color Palette**: Pink primary (`#FF4F81`), soft pink background (`#FFF5F8`)
- **UI Style**: Glassmorphism with backdrop blur, soft shadows, and gradient accents
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Icons**: Lucide React
- **Responsive**: Mobile-first with bottom navigation bar

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/)
3. Add all environment variables from `.env` to Vercel's Environment Variables settings
4. Deploy — Vercel will automatically run `prisma generate` via the `postinstall` script

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Made with 💖 by [neilmasion](https://github.com/neilmasion)**
