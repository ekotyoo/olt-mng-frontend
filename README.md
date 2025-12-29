# OLT Management System (Buroq.net)

A comprehensive ISP Management System incorporating OLT Hardware Control, Radius Authentication, CRM, and Automated Billing.

## 🌟 Key Features

### 1. Network Management
*   **OLT Synchronization**: Auto-discovers OLTs, PON Ports, and ONUs.
*   **Traffic Analysis**: Real-time traffic monitoring for Uplink Interfaces.
*   **Network Map**: Visual geographic distribution of customers and infrastructure.
*   **NAS Management**: Manage Mikrotik/Cisco routers acting as Radius Clients.

### 2. CRM & Billing
*   **Customer Management**: Profiles, Plans, and Subscription tracking.
*   **Automated Invoicing**: Generates invoices on the 1st of every month.
*   **PDF Printing**: Professional A4 invoice generation.
*   **Policy Enforcement**: Configurable "Max Unpaid Invoices" limit.

### 3. Radius & Enforcement
*   **PPPoE Authentication**: Radius-based authentication for subscribers.
*   **Bandwidth Control**: Auto-syncs speed limits (`Mikrotik-Rate-Limit`) to routers.
*   **Real-Time Disconnect (CoA)**: Instantly terminates sessions for suspended/delinquent users via RFC 3576.

## 🛠️ Architecture

*   **Framework**: Next.js 15 (App Router)
*   **Database**: PostgreSQL + Prisma ORM
*   **Styling**: Tailwind CSS + Shadcn UI
*   **Radius Interaction**:
    *   Database: `radcheck`, `radreply`, `radacct` (Freeradius Schema)
    *   CoA: Native UDP Packet Sender (`src/lib/radius/coa.ts`)

## 🚀 Setup & Configuration

### 1. Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/olt_db"
NEXT_PUBLIC_MAP_DEFAULT_LAT=-6.200000
NEXT_PUBLIC_MAP_DEFAULT_LNG=106.816666
CRON_SECRET=your_secret_token_here
```

### 2. Database
```bash
npx prisma db push
```

### 3. First Run
1.  **Sync OLT**: Go to **Settings > OLTs** and add your OLT.
2.  **Add Router (NAS)**: Go to **Settings > NAS** and add your Mikrotik IP and Secret.
3.  **Configure Billing**: Go to **Settings > Global Billing** to set Due Day and Max Unpaid limits.

## 🤖 Automation

### Daily Billing Job
The system includes an automation endpoint at `/api/cron`.
*   **Trigger**: Configure your server `crontab` to `curl` this URL once daily.
*   **Actions**:
    *   **1st of Month**: Generates new Invoices.
    *   **Daily**: Checks for unpaid users > Limit.
    *   **Action**: Suspends User + Sends CoA Disconnect Packet.

## 📂 Project Structure
*   `src/app/actions`: Server Actions (Backend Logic)
*   `src/lib/olt`: Telnet interactions with ZTE/Huawei OLTs.
*   `src/lib/radius`: CoA and Session management.
*   `src/components`: UI Components.
