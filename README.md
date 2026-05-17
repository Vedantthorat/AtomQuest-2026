# AtomTrack AI 🎯

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)](https://tailwindcss.com)
[![Anthropic](https://img.shields.io/badge/AI-Anthropic-orange)](https://www.anthropic.com)

**Enterprise Goal Setting & Tracking Portal** — Built for a hackathon with full Phase 1 & Phase 2 BRD compliance.

---

## Tagline
*AI-Powered Goal Management for Modern Enterprises*

AtomTrack AI transforms how organizations set, track, and achieve goals through intelligent automation, real-time analytics, and an intuitive AI assistant that helps employees create SMART goals.

---

## Key Features ✨

- **🎯 SMART Goal Creation** — AI assistant transforms vague ideas into structured goals
- **⚖️ Weightage Validation** — Real-time 100% budget enforcement with visual tracker
- **📅 Quarterly Check-ins** — Automated Q1-Q4 progress tracking with deadline enforcement
- **🔐 Approval Workflow** — Manager approval/return/unlock with role-based access
- **📊 Analytics Dashboard** — 15+ charts including QoQ trends, thrust area distribution, team performance
- **🔔 Escalation Engine** — Auto-escalation rules for compliance (L1→L2→L3)
- **📝 Audit Trail** — Complete activity logging for admin visibility
- **🌙 Dark Mode** — Full dark/light theme support
- **💾 Demo Mode** — Works without backend using mock data

---

## Demo Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Employee** | employee@atomtrack.com | password123 | Create goals, check-ins |
| **Manager** | manager@atomtrack.com | password123 | Approve goals, view team |
| **Admin** | admin@atomtrack.com | password123 | Full system access |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React SPA)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + Tailwind + Zustand + Recharts + Router    │
└────────────────────────────────────────┬────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Express.js)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Auth API   │  │  Goals API   │  │Analytics API │  │   AI API     │   │
│  │   (JWT)      │  │  (CRUD)      │  │  (Charts)    │  │  (Claude)    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Approvals API│  │Escalation API│  │Audit API     │  │Notifications │   │
│  │ (Workflow)   │  │  (Auto-L1/L2)│  │  (Logging)   │  │  (Real-time) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Socket.IO (Real-time Events)                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────┬────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (PostgreSQL)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Prisma ORM │ Users │ Goals │ Check-ins │ Notifications │ Audit │ Escalations│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL APIs                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Anthropic Claude (AI Goal Generation & Q&A)                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Highlights
- **Frontend**: SPA with Zustand state management, lazy-loaded routes
- **Backend**: Modular Express routes with middleware pattern
- **Database**: PostgreSQL with Prisma ORM, indexed queries
- **Real-time**: Socket.IO for push notifications
- **AI**: Anthropic Claude Haiku for SMART goal generation and Q&A
- **Security**: JWT auth with role-based access control

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **State** | Zustand |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |
| **Backend** | Express.js, Prisma |
| **Database** | PostgreSQL |
| **AI** | Anthropic Claude API |
| **DevOps** | Docker, Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (optional for demo mode)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-org/atomtrack-ai.git
cd atomtrack-ai

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies (optional)
cd ../backend && npm install
```

### Environment Variables

Create `.env` files:

```env
# frontend/.env
VITE_API_URL=http://localhost:3000/api
VITE_ANTHROPIC_API_KEY=your-anthropic-key

# backend/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/atomtrack
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Database Setup

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Run Development Servers

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend (optional)
cd backend
npm run dev
```

Open http://localhost:5173

### Docker Setup

```bash
docker-compose up --build
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `ANTHROPIC_API_KEY` | Anthropic AI API key | Optional |
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |

---

## Cost Optimisation 💰

### Infrastructure Cost Estimate for 500 Users: **~$7/month**

| Component | Choice | Cost |
|-----------|--------|------|
| Frontend | Vercel | $0/mo |
| Backend | Railway | ~$5/mo |
| Database | Supabase | $0/mo |
| AI API | Anthropic | ~$2/mo |

### Optimisations Implemented

- ✅ **AI Response Caching** — 24-hour cache reduces API calls by ~70%
- ✅ **Code Splitting** — React lazy loading reduces initial bundle
- ✅ **Multi-stage Docker** — Production image ~15MB
- ✅ **Database Indexing** — Composite indexes on frequently queried columns
- ✅ **Pagination** — Offset-based with cursor fallback
- ✅ **Mock Data Mode** — Demo works without backend

### Scalability Path
- **Current:** Single server, ~500 users
- **Phase 2:** Add Redis, ~5,000 users
- **Phase 3:** Load balancer + auto-scaling, ~50,000 users
- **Cost at scale:** ~$50-100/mo for 5,000 users

---

## BRD Compliance ✅

### Phase 1 Requirements
- ✅ 3 roles: Employee, Manager, Admin
- ✅ Goal creation with validation
- ✅ Weightage = 100%, min 10%, max 8 goals
- ✅ 8 Thrust Areas
- ✅ 4 UoM Types (MIN, MAX, TIMELINE, ZERO)
- ✅ Quarterly check-ins
- ✅ Approval workflow
- ✅ Analytics dashboard

### Phase 2 Requirements
- ✅ Shared goals
- ✅ Escalation engine
- ✅ Audit trail
- ✅ Notifications
- ✅ AI assistant
- ✅ Reports & export

### Good-to-Have Features
- ✅ Dark mode toggle
- ✅ Profile management
- ✅ Settings page
- ✅ Cost dashboard
- ✅ Demo phase control

---

## Evaluation Criteria Mapping

| Criteria | How We Address |
|----------|----------------|
| **Innovation** | AI-powered SMART goal generator with caching |
| **Business Impact** | Weightage validation, quarterly tracking |
| **Technical Complexity** | Full-stack with AI integration, real-time validation |
| **UI/UX** | Responsive design, dark mode, 15+ charts |
| **Presentation** | Demo mode, phase switcher, cost dashboard |
| **Scalability** | Docker-ready, cost-aware architecture |

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/goals` | Get user goals | Employee+ |
| POST | `/api/goals` | Create goal | Employee+ |
| PUT | `/api/goals/:id` | Update goal | Employee+ |
| PUT | `/api/goals/:id/approve` | Approve goal | Manager+ |
| POST | `/api/checkins` | Submit check-in | Employee+ |
| GET | `/api/analytics` | Get analytics | Manager+ |
| GET | `/api/escalations` | Get escalations | Manager+ |
| GET | `/api/audit` | Get audit trail | Admin |

---

## Folder Structure

```
atomtrack-ai/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ai/         # AI-related components
│   │   │   ├── admin/      # Admin components
│   │   │   ├── escalation/ # Escalation components
│   │   │   └── layout/     # Layout components
│   │   ├── pages/          # Route pages
│   │   ├── stores/         # Zustand stores
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilities
│   │   ├── types/          # TypeScript types
│   │   └── config/         # Configuration
│   └── index.html
├── backend/
│   └── src/
│       ├── modules/        # Express modules
│       ├── config/         # Backend config
│       └── prisma/         # Database schema
├── database/
│   └── prisma/
│       └── schema.prisma
├── docker-compose.yml
├── nginx.conf
├── .env.example
└── README.md
```

---

## Demo Script (8 Steps for Judges)

1. **Login as Employee** — Show goal creation with weightage tracker
2. **Create SMART Goal** — Use AI assistant to generate a goal
3. **Submit for Approval** — Show goal transitions from Draft→Pending
4. **Login as Manager** — Approve the goal, show team view
5. **Quarterly Check-in** — Submit Q1 progress
6. **View Analytics** — Show 4 tabs with 15+ charts
7. **Login as Admin** — Show escalations, audit trail, cost dashboard
8. **Demo Phase Control** — Switch between cycle phases to show enforcement

---

## License

MIT License — Built for the hackathon 🎉