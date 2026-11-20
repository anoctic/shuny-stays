# 🏢 PG Manager — Multi-Tenant Paying Guest & PostgreSQL Management SaaS

A production-ready **Next.js (App Router)** SaaS application built with **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**, engineered for multi-tenant property operations (Paying Guest/Hostels) alongside an integrated **PostgreSQL Management Studio** with role-based access control (RBAC) and row-level security (RLS).

---

## 🌟 Architecture & Key Features

### 1. 🔐 Supabase Auth, Memberships & Role-Based Access Control (RBAC)
- **Memberships Table (`public.memberships`)**: Links authenticated `auth.users` to an `organization_id` with one of three roles:
  - 👑 **`super_admin`**: Platform administrator. Can view all organizations, create new organizations, switch tenant context, and exclusively access the **Super Admin Area** and **PostgreSQL Studio** (SQL Console, schema introspection, RLS auditor).
  - 🏢 **`owner`**: PG / Hostel business owner. Strictly locked to their organization. Manages properties, rooms, beds, resident KYC, billing/invoicing, and complaints.
  - 🛏️ **`resident`**: Paying Guest resident. Strictly locked to their assigned hostel. Can view their room, bed allocation, rent receipts, and submit maintenance tickets.
- **Strict RLS Enforcement**: The active organization is derived directly from the logged-in user's membership via database-level RLS functions (`is_super_admin()`, `get_current_user_org_ids()`). Regular users (`owner`, `resident`) cannot tamper with or override their organization through dropdowns, URL parameters, or client cookies.
- **Service Role Key Security**: `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side code (`src/lib/supabase/admin.ts`). It is never exposed in `NEXT_PUBLIC_*` variables or bundled into client code.

### 2. 🛏️ Paying Guest (Hostel / Co-living) Operations
- **Multi-Tenant Isolation**: Each organization operates with complete cryptographic isolation via PostgreSQL RLS policies.
- **Properties & Hostels**: Manage multiple buildings, floors, warden contacts, and amenities.
- **Rooms & Bed Allocation Matrix**: Live visual occupancy status across Single, Double, Triple, and Dormitory rooms with AC / non-AC classification.
- **Resident Directory & KYC**: Track resident profiles, ID proof references, room allocations, and emergency contacts.
- **Rent Invoicing & Billing**: Generate monthly rent invoices, track electricity/maintenance utility fees, and monitor payment statuses.
- **Maintenance Tickets**: Resolution workflow for electrical, plumbing, Wi-Fi, and carpentry complaints.

### 3. 🐘 PostgreSQL Database Management Studio (Restricted to `super_admin`)
- **Interactive SQL Console**: Safe SQL playground with schema presets, live execution timer, and paginated results grid.
- **Schema & Catalog Browser**: Introspect PostgreSQL tables, primary keys, column types, and disk consumption.
- **Row Level Security (RLS) Auditor**: Audit active tenant isolation policies directly from `pg_policies`.
- **Cluster Telemetry**: Real-time stats on connection counts, buffer cache hit ratios, and database storage.

---

## 📁 Project Folder Structure

```
pg-management/
├── supabase/
│   ├── migrations/
│   │   ├── 001_multi_tenant_schema.sql       # Organizations, properties, rooms, beds, residents, invoices
│   │   ├── 002_row_level_security.sql        # Supabase RLS policies for multi-tenant isolation
│   │   ├── 003_pg_admin_helpers.sql          # Safe PostgreSQL RPC functions for schema & SQL execution
│   │   └── 004_auth_memberships_rls.sql      # Memberships table, RBAC security definers, and role policies
│   └── seed.sql                              # Seed data for demo tenants, rooms, beds, and demo memberships
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                        # Root layout with typography and metadata
│   │   ├── page.tsx                          # Route redirect to /dashboard
│   │   ├── login/                            # Supabase Auth login & 1-click demo switcher
│   │   │   └── page.tsx
│   │   ├── auth/callback/route.ts            # Supabase Auth exchange callback handler
│   │   │
│   │   ├── (dashboard)/                      # Role-Guarded Application Shell
│   │   │   ├── layout.tsx                    # App Shell: Sidebar + Header with Role awareness
│   │   │   ├── dashboard/page.tsx            # Role-aware dashboard & metrics
│   │   │   ├── properties/page.tsx           # Buildings & PG Hostels management
│   │   │   ├── rooms/page.tsx                # Room types, AC/Non-AC, Bed occupancy matrix
│   │   │   ├── residents/page.tsx            # Resident KYC, check-in, emergency contacts
│   │   │   ├── billing/page.tsx              # Invoicing, rent collections, due dates
│   │   │   ├── complaints/page.tsx           # Maintenance tickets tracker
│   │   │   │
│   │   │   ├── admin/                        # 🛡️ Super Admin Area (Forbidden to owner/resident)
│   │   │   │   └── organizations/page.tsx    # Create and manage organizations
│   │   │   │
│   │   │   └── database/                     # 🐘 PostgreSQL Studio (Restricted to super_admin)
│   │   │       ├── layout.tsx                # Layout route guard enforcing super_admin role
│   │   │       ├── page.tsx                  # Cluster telemetry & stats
│   │   │       ├── schema/page.tsx           # Table catalog & disk sizes
│   │   │       ├── query/page.tsx            # Interactive SQL Console
│   │   │       └── rls/page.tsx              # RLS Policy Auditor
│   │   │
│   │   ├── actions/
│   │   │   └── auth.ts                       # Server Actions for Sign In, Sign Out, Org Management
│   │   │
│   │   └── api/                              # Route Handlers
│   │       ├── admin/organizations/route.ts  # Super admin organization provisioning API
│   │       ├── database/query/route.ts       # Safe SQL query execution API (super_admin only)
│   │       ├── database/schema/route.ts      # Database schema introspection API (super_admin only)
│   │       └── tenants/route.ts              # Organization switcher API (super_admin only)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                   # Dynamic RBAC navigation sidebar
│   │   │   └── Header.tsx                    # Organization Switcher (super_admin) or Locked Org Pill
│   │   ├── pg/
│   │   │   └── BedOccupancyGrid.tsx          # Visual bed status (Occupied, Vacant, Maintenance)
│   │   └── postgres/
│   │       └── SqlConsole.tsx                # Interactive SQL playground with presets & results grid
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   └── session.ts                    # Session resolver, role verification & tenant lock
│   │   ├── supabase/
│   │   │   ├── client.ts                     # Browser Supabase client (@supabase/ssr)
│   │   │   ├── server.ts                     # Server Supabase client with Next.js cookies()
│   │   │   ├── admin.ts                      # Service Role client (SERVER ONLY)
│   │   │   └── middleware.ts                 # Session & cookie refresher
│   │   ├── tenant/
│   │   │   ├── constants.ts                  # Default tenant & demo metadata
│   │   │   └── context.ts                    # Server-side tenant resolver
│   │   ├── mock-data.ts                      # Local seed data for development
│   │   └── utils.ts                          # Tailwind helper, INR currency formatter
│   │
│   ├── types/
│   │   ├── database.types.ts                 # Supabase generated database definitions
│   │   ├── pg-domain.types.ts                # Domain models & MembershipRole types
│   │   └── postgres-admin.types.ts           # Schema, TableInfo, QueryResult, ClusterStats
│   │
│   └── middleware.ts                         # Multi-tenant session middleware
│
├── .env.example                              # Template for Supabase credentials & DB URL
└── package.json                              # Next.js 16 + React 19 + Tailwind CSS dependencies
```

---

## 🚀 Quick Start Guide

### 1. Project Workspace
The project is located at:
```bash
cd C:\Users\anoct\.gemini\antigravity\scratch\pg-management
```

### 2. Environment Configuration
Verify that `.env.local` contains your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-region.pooler.supabase.com:6543/postgres
```

### 3. Run Supabase Database Migrations
Run the SQL migration scripts in your Supabase SQL Editor in sequence:
1. `supabase/migrations/001_multi_tenant_schema.sql` (Tables for organizations, properties, rooms, beds, residents, invoices)
2. `supabase/migrations/002_row_level_security.sql` (Initial tenant isolation RLS)
3. `supabase/migrations/003_pg_admin_helpers.sql` (Postgres catalog inspection & SQL runner RPCs)
4. `supabase/migrations/004_auth_memberships_rls.sql` (`memberships` table, `is_super_admin()`, and membership-bound RLS)
5. `supabase/seed.sql` (Seed organizations, rooms, beds, demo residents, and memberships)

### 4. Run Development Server & Production URL
- **Production URL:** **[https://shunystays.com](https://shunystays.com)** (Cloudflare Pages fallback: `https://shunystays.pages.dev`)
- **Local Dev Server:**
```bash
npm run dev
```
The local server runs on **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 Testing Role-Based Personas (Instant 1-Click Demo in Dev)

On the **[http://localhost:3000/login](http://localhost:3000/login)** page (in development mode), you can either sign in with your Supabase credentials or use the 1-click demo switcher cards:

| Persona | Role | Capabilities |
| :--- | :--- | :--- |
| **Alexander Vance** | `super_admin` | Full platform control. Can access Super Admin Area (`/admin/organizations`), create new organizations, switch active organization context, and access PostgreSQL Studio (`/database`, `/database/query`, `/database/schema`, `/database/rls`). |
| **Rajesh Mittal** | `owner` | PG Owner. Locked to `Zenith Luxury PG & Hostels`. Manages properties, rooms, beds, resident KYC, billing, and complaints. Super Admin Area and PostgreSQL Studio are hidden & blocked (403 Forbidden). |
| **Aditya Sharma** | `resident` | Paying Guest resident. Locked to `Zenith Luxury PG & Hostels`. Can view assigned room & bed, rent receipts, and submit complaints. All admin and database routes are blocked. |
