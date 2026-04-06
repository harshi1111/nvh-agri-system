<div align="center">
  
  <br />
  <img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/logo-alone (1).png" alt="NVH Logo" width="120" />
  
  #  **NVH AGRI GREEN**
  
  ### *family farm management system*
  
  <br />
  
  [![Live Site](https://img.shields.io/badge/live%20site-nvhagrigreen.qzz.io-%23D4AF37?style=for-the-badge&logo=vercel&logoColor=white&labelColor=%230A120A)](nvh-agri-system-demo.vercel.app)
  [![GitHub Repo](https://img.shields.io/badge/github-source%20code-%23D4AF37?style=for-the-badge&logo=github&logoColor=white&labelColor=%230A120A)](https://github.com/harshi1111/nvh-agri-system)
  
  <br />
  
  *Built for my father, so he never has to juggle paper journals again.*
  
  <br />
  
  [📖 About](#-about) • 
  [✨ Features](#-features) • 
  [🛠️ Architecture](#️-architecture) • 
  [🔒 Security](#-security) • 
  [💾 Backups](#-backups) • 
  [🎥 Demo](#-demo)
  
</div>

<br />

---

## 📖 **About**

My father manages our family farm. Every day, he'd jot down expenses in multiple notebooks—labour wages, tractor fuel, seeds purchased, crop sales. At month-end, he'd spend hours adding everything up, often missing entries or making mistakes.

**NVH Agri Green is my solution.** It's a simple, digital version of his farming journal—but smarter.

<br />

---

## ✨ **Features**

### 👥 **Farmer/Customer Records**
- Store basic info: name, phone, address
- **Aadhaar OCR** – Upload image, auto-fill details
- Search anyone instantly
- Archive old records instead of deleting

### 🌾 **Field/Project Tracking**
- Each farmer's fields as separate "projects"
- Track location: country, state, district, city, village
- Record field size in acres
- Mark status: active, completed, on hold

### 💰 **Money Tracking**
- Daily expenses: labour, transport, food, ploughing, tractor, manure
- Investments: money put into the field
- Automatically calculates profit/loss per field
- Dashboard shows real-time totals

### 📄 **Reports**
- Generate PDF summary for any period
- Professional formatting with tables
- Share with family, keep for tax records

<br />

---

## 🛠️ **Architecture**

### **Frontend – What You See**
```typescript
Framework: Next.js 16.1.6 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS
Animations: GSAP + CSS Keyframes
Icons: Lucide React
```

### **Backend – Where Data Lives**
```typescript
Database: Supabase (PostgreSQL)
  - Storage: 500 MB free (currently 25 MB)
  - Features: Row Level Security, Auth built-in
  
Storage: Supabase Storage
  - Type: Private buckets
  - Capacity: 1 GB free (currently 20 MB)
  - Security: Signed URLs (expire in 1 hour)

Hosting: Vercel (Edge network, 300+ locations)
Authentication: Supabase Auth (JWT based)
```

### **Special Features Explained**

<details>
<summary><b>📸 Aadhaar OCR (Tesseract.js)</b></summary>
<br />

**How it works:**
1. Image uploaded → processed in browser (client-side)
2. Tesseract.js extracts text
3. Pattern matching finds:
   - 12-digit number → Aadhaar number
   - DD/MM/YYYY → Date of birth
   - "Male"/"Female" → Gender
4. Form auto-fills automatically

**Technical details:**
- Library: Tesseract.js v7
- Deployment: Local files (no CDN, avoids CSP issues)
- Accuracy: ~95% for Indian Aadhaar cards
- Fields extracted: Aadhaar number, DOB, Gender

*All processing happens in browser. No data leaves during OCR.*
</details>

<details>
<summary><b>📊 PDF Generation (jsPDF)</b></summary>
<br />

**How it works:**
1. Fetches filtered data from database
2. Formats into structured tables using autoTable
3. Adds summary totals, headers, footers
4. Saves as PDF file

**Features:**
- Multi-page support
- Professional formatting
- Summary tables
- Customer/project wise breakdown
</details>

<details>
<summary><b>🌍 Location Data (country-state-city)</b></summary>
<br />

**Purpose:** Project location dropdowns

**Coverage:** Global (but default: India)

**Features:**
- Country → State → District → City → Village hierarchy
- Works offline (data built-in)
- No API calls needed
</details>

<details>
<summary><b>📊 Monitoring & Analytics</b></summary>
<br />

- **Sentry** – Error tracking, real-time alerts, GitHub integration
- **UptimeRobot** – 5-minute checks, email if site down
- **Vercel Analytics** – Visitor stats (privacy-first, no cookies)
- **Supabase Dashboard** – Track database size and usage
</details>

<br />

---

## 🎥 **Demo Video**

<div align="center">
  <a href="https://youtu.be/your-video-link">
    <img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/video-thumbnail.png" alt="Demo Video" width="80%" style="border-radius: 15px; border: 2px solid #D4AF37;" />
    <br />
    <img src="https://img.shields.io/badge/▶️%20WATCH%20DEMO-%23D4AF37?style=for-the-badge&logo=youtube&logoColor=white&labelColor=%230A120A" />
  </a>
  <p><i>5-minute walkthrough of all features</i></p>
</div>

<br />

---
## 📸 Screenshots
<div align="center"> <table> <tr> <td><img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/screenshot-dashboard.png" width="100%" /></td> <td><img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/screenshot-customers.png" width="100%" /></td> </tr> <tr> <td align="center"><i>Dashboard — at a glance</i></td> <td align="center"><i>Customers — all your farmers</i></td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/screenshot-accounting.png" width="100%" /></td> <td><img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/screenshot-project.png" width="100%" /></td> </tr> <tr> <td align="center"><i>Accounting — money matters</i></td> <td align="center"><i>Project View — field details</i></td> </tr> </table> </div>

## 🔒 **Security**

### **Aadhaar Images**
- Stored in **private Supabase bucket** (not public)
- Accessed via **signed URLs** that expire in 1 hour
- Even if URL shared, it won't work after expiry

### **Database**
- **Row Level Security (RLS)** enabled
- Each user sees ONLY their data
- Even developer can't bypass without proper auth

### **Secrets & Keys**
- All secrets in `.env.local` (gitignored)
- Never committed to GitHub
- Environment variables in Vercel (encrypted)

### **Website**
- HTTPS always on (encrypted)
- Security headers configured (CSP, XSS protection)
- Regular dependency updates via Dependabot

<br />

---

## 💾 **Backups**

### **Automatic (GitHub Actions)**
Every Sunday at 2 AM UTC:
- Exports all tables: `customers`, `projects`, `transactions`, `transaction_types`
- Saves as JSON with timestamp
- Stores in GitHub Artifacts (30 days retention)
- Current backup size: ~2.82 KB

### **Manual Backup**
Can trigger anytime from GitHub Actions tab.

### **Restore Process (If Needed)**
```bash
# 1. Clone repo
git clone https://github.com/harshi1111/nvh-agri-system.git

# 2. Install dependencies
npm install

# 3. Set environment variables
# Edit .env.local with your keys

# 4. Run restore script
node scripts/restore.js backup-2024-03-15.json

# 5. Deploy
vercel --prod
```

**Time to restore:** ~30 minutes  
**Maximum data loss:** 7 days

<br />

---

## 📁 **Project Structure**

```
nvh-agri-system/
├── app/                    # Next.js App Router pages
│   ├── accounting/        # Money tracking
│   ├── api/               # Backend endpoints
│   ├── auth/              # Login/reset password
│   ├── customers/         # Farmer records
│   ├── dashboard/         # Home page
│   ├── reports/           # PDF generator
│   └── settings/          # Profile & backup
├── components/            # Reusable UI pieces
│   ├── ui/                # shadcn components
│   ├── AddProjectModal.tsx
│   ├── AadhaarScanner.tsx # OCR magic
│   └── ProjectZoomView.tsx
├── lib/                   # Core logic
│   ├── actions/           # Server actions
│   └── supabase/          # Database client
├── public/                # Static assets
│   └── tesseract/         # Local OCR files
└── types/                 # TypeScript definitions
```

<br />

---

## 🌱 **Running Locally**

```bash
# 1. Clone repository
git clone https://github.com/harshi1111/nvh-agri-system.git
cd nvh-agri-system

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Start development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### **Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENTRY_AUTH_TOKEN=your_sentry_token
```

<br />

---

## 👩‍💻 **Built By**

**Harshitha**  
*Just helping my father go digital*

[![GitHub](https://img.shields.io/badge/GitHub-harshi1111-%23D4AF37?style=flat-square&logo=github&logoColor=white&labelColor=%230A120A)](https://github.com/harshi1111)

<br />

---

## 🙏 **Thanks To**

- **Supabase** – Free database hosting
- **Vercel** – Free website hosting
- **Tesseract.js** – Open-source OCR
- **Tailwind CSS** – Makes styling easy
- **My father** – For trusting me with this

<br />

---

<div align="center">
  
  *This project is private to our family. Not for commercial use.*
  
  <br />
  
  <sub>Last updated: March 2026</sub>
  
</div>
