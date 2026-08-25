## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Hosting & Infrastructure Options:** - *Edge / Serverless:* [Cloudflare Pages](https://pages.cloudflare.com/) via `@opennextjs/cloudflare`
  - *Traditional / VPS:* [DICT Windows Virtual Machine](https://dict.gov.ph/) (Windows Server + IIS + PM2)
- **Database & Auth:** Postgresql 
- **Styling & UI:** Tailwind CSS v4, shadcn/ui
- **Payments:** Link.BizPortal
- **Storage:** DICT VM

---

## System Prerequisites & Node.js Installation

Before cloning and running the repository, ensure your environment meets the runtime requirements.

### 1. Install Node.js (LTS v20+ or v22+)
Next.js requires a modern Node.js runtime environment.
- **Windows / macOS / Linux:** Download and install the official LTS release from [nodejs.org](https://nodejs.org/).
- Verify installation in your terminal:
  ```bash
  node -v  # Should output v20.x.x or higher
  npm -v   # Should output 10.x.x or higher

  ```

### 2. Install Git for Windows / macOS

Required for repository cloning and version control. Ensure Git is added to your system PATH.

---

## Local Development Setup (Developer Workstations)

Follow these steps to set up and run the repository on your local machine:

### Step 1: Clone the Repository

```bash
git clone [https://github.com/your-org/digital-scouts.git](https://github.com/your-org/digital-scouts.git)
cd digital-scouts

```

### Step 2: Install Project Dependencies

```bash
npm install

```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory of your project and configure your local database connection:

```env
# Application Port
PORT=5000

# PostgreSQL Connection Details
# Replace 'your_password_here' with the actual password for the postgres user
# If you created a different user, change 'postgres' to that username
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bsp_digital_platform

# EMAIL_FROM="Boy Scouts of the Philippines <onboarding@resend.dev>"

DATABASE_URL="postgresql://postgres:admin@127.0.0.1:5432/bsp_digital_platform"

GMAIL_USER="bspproject.ictu@gmail.com"
GMAIL_APP_PASS="suuxbaihtoepqlus"
EMAIL_FROM="E-Scouts <bspproject.ictu@gmail.com>"

SMTP_HOST="smtp.gmail.com"

```

### Step 4: Run the Development Server

Start your local Next.js development server:

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to view the application.

---

## Database Management & Drizzle ORM

This project uses **Drizzle ORM** to manage PostgreSQL database schemas safely and efficiently.

1. **Push Schema Changes to Database:**
Whenever schema definitions in `src/lib/schema.ts` are updated, sync them to your database instance:
```bash
npx drizzle-kit push

```

## Project Team Roles & Architecture

* **DevOps Lead / Infrastructure Architect:** Manages Windows Server / Cloudflare infrastructure, IIS reverse proxy configuration, security policies, and domain mapping (`.gov.ph` via DICT GWHS).
* **Tech Lead:** Manages code standards, Zod data contracts (`src/lib/schema.ts`), and pull request reviews.
* **Developer A (Frontend):** Builds mobile-first UI, registration multi-step forms (steppers), and interactive virtual ID flip cards.
* **Developer B (Backend):** Manages PostgreSQL schemas, Drizzle ORM models, and secure Server Actions.
* **Developer C (Integration):** Handles Link.BizPortal, authentication flows (Neon Auth / Email OTP / Google SSO), and file storage.

---

## 📄 License

Copyright © 2026 Boy Scouts of the Philippines (BSP). All rights reserved.
