<div align="center">
  
  <br />
  <img src="https://raw.githubusercontent.com/harshi1111/nvh-agri-system/main/public/images/logo-alone.png" alt="NVH Logo" width="120" />
  
  # 🌾 **NVH AGRI GREEN**
  
  ### *family farm management system*
  
  <br />
  
  [![Live Site](https://img.shields.io/badge/live%20site-nvhagrigreen.qzz.io-%23D4AF37?style=for-the-badge&logo=vercel&logoColor=white&labelColor=%230A120A)](https://nvhagrigreen.qzz.io)
  [![GitHub Repo](https://img.shields.io/badge/github-source%20code-%23D4AF37?style=for-the-badge&logo=github&logoColor=white&labelColor=%230A120A)](https://github.com/harshi1111/nvh-agri-system)
  
  <br />
  
  *Built for my father, so he never has to juggle paper journals again.*
  
  <br />
  
  [📖 About This Project](#-about-this-project) • 
  [🛠️ How It Works](#️-how-it-works) • 
  [🔒 Security](#-security) • 
  [💾 Backups](#-backups)
  
</div>

<br />

---

## 📖 **About This Project**

My father manages our family farm. Every day, he'd jot down expenses in multiple notebooks—labour wages, tractor fuel, seeds purchased, crop sales. At month-end, he'd spend hours adding everything up, often missing entries or making mistakes.

**NVH Agri Green is my solution.**

It's a simple, digital version of his farming journal—but smarter. Now he can:
- ✅ See all farmer/customer details in one place
- ✅ Track every rupee spent and earned
- ✅ Know exactly how much profit each field made
- ✅ Never lose records to rain, fire, or misplaced notebooks

This isn't a startup or a product for millions. It's just **our family's farm, digitized.**

<br />

---

## ✨ **What It Does**

### 👥 **Farmer/Customer Records**
- Store basic info: name, phone, address
- Scan Aadhaar card to auto-fill details (saves typing)
- Search for anyone instantly
- Archive old records instead of deleting

### 🌾 **Field/Project Tracking**
- Each farmer's fields as separate "projects"
- Track location (village, district, state)
- Record field size in acres
- Mark status: active, completed, on hold

### 💰 **Money Tracking**
- Daily expenses: labour, transport, food, ploughing, tractor, manure
- Investments: money put into the field
- Automatically calculates profit/loss per field
- See totals at a glance on dashboard

### 📄 **Reports**
- Generate PDF summary for any period
- Share with family members
- Keep digital copies for tax records

<br />

---

## 🛠️ **How It Works**

### **Frontend (What you see)**
- **Next.js** – Makes the website fast and smooth
- **TypeScript** – Helps me catch errors while coding
- **Tailwind CSS** – Makes everything look clean
- **GSAP & CSS** – Adds small animations (flying bird, sunrise) just for fun

### **Backend (Where data lives)**
- **Supabase** – Database that stores all our farm data
- **Vercel** – Hosts the website (free tier)

### **Special Features**

<details>
<summary><b>📸 Aadhaar Scanning</b></summary>
<br />

When we upload an Aadhaar image, the system:
1. Sends the image to **Tesseract.js** (OCR library running locally in browser)
2. Extracts text from the image
3. Looks for patterns:
   - 12-digit number → Aadhaar number
   - DD/MM/YYYY → Date of birth  
   - "Male"/"Female" → Gender
4. Auto-fills the form

*All processing happens in your browser. No data leaves your computer during OCR.*
</details>

<details>
<summary><b>📊 PDF Reports</b></summary>
<br />

The system uses **jsPDF** to create reports:
- Takes data from database
- Formats into tables
- Adds summary totals
- Saves as PDF file

Perfect for sharing with family or keeping for tax records.
</details>

<details>
<summary><b>🌍 Location Data</b></summary>
<br />

The **country-state-city** library provides dropdowns for:
- Country (default: India)
- State (Tamil Nadu, Kerala, etc.)
- District
- City
- Village

All data is built-in, works offline.
</details>

<br />

---

## 🔒 **Security (How We Keep Data Safe)**

### **Aadhaar Images**
- Stored in **private storage** (not publicly accessible)
- When viewing, system generates a **signed URL** that expires in 1 hour
- Even if someone gets the link, it won't work after expiry

### **Database**
- **Row Level Security** enabled
- Each user can only see their own data
- Even I (as developer) can't access other people's data without proper authentication

### **Passwords & Keys**
- All secrets stored in **environment variables** (never in code)
- `.env.local` file is **gitignored** (not on GitHub)
- Passwords hashed using bcrypt

### **Website**
- HTTPS always on (encrypted connection)
- Security headers configured
- Regular dependency updates via Dependabot

<br />

---

## 💾 **Backups (What If Something Goes Wrong)**

### **Automatic Backups (GitHub Actions)**
Every Sunday at 2 AM UTC, the system:
1. Connects to database using service role key
2. Exports all tables:
   - customers
   - projects
   - transactions
   - transaction_types
3. Saves as JSON file with date stamp
4. Stores in GitHub Actions artifacts (30 days retention)

### **Manual Backup**
Can trigger anytime from GitHub Actions tab.

### **Restore Process (If Needed)**
1. Clone repository from GitHub
2. Install dependencies: `npm install`
3. Set environment variables
4. Run restore script: `node scripts/restore.js backup-file.json`
5. Deploy: `vercel --prod`

**Time to restore:** ~30 minutes
**Maximum data loss:** 7 days

<br />

---

## 📊 **Current Usage & Limits (Free Tier)**

| Resource | Free Limit | Current Usage | What This Means |
|----------|------------|---------------|-----------------|
| **Database** | 500 MB | 25.68 MB | Can store ~50,000 customer records |
| **Storage** | 1 GB | 20 MB | Can store ~1,000 Aadhaar images |
| **Bandwidth** | 2 GB/month | 12 MB | ~10,000 page views/month |
| **Users** | 50,000/month | 2 users | Just family for now |

**Bottom line:** Free tier will last us **2-3 years** easily.

<br />

---

## 📁 **Project Structure (For My Future Reference)**
```
nvh-agri-system/
├── app/ # Main website pages
│ ├── accounting/ # Money tracking page
│ ├── customers/ # Farmer records
│ ├── dashboard/ # Home page with summary
│ ├── reports/ # PDF report generator
│ └── settings/ # Profile & backup
├── components/ # Reusable pieces
│ ├── AddProjectModal.tsx # Add new field
│ ├── AadhaarScanner.tsx # OCR scanning
│ └── ProjectZoomView.tsx # Field details
├── lib/ # Helper functions
│ ├── actions/ # Database operations
│ └── supabase/ # Database connection
├── public/ # Images & files
│ └── tesseract/ # OCR files (downloaded locally)
└── types/ # TypeScript definitions
```


<br />

---

## 🚀 **Running Locally (For Development)**
```
# 1. Clone the repository
git clone https://github.com/harshi1111/nvh-agri-system.git
cd nvh-agri-system

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with actual keys

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:3000
```
```
Environment Variables Needed
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SENTRY_AUTH_TOKEN=your_sentry_token
```
## **📈 Monitoring (Keeping Track)**
Sentry – Alerts me if any errors occur on the site

UptimeRobot – Checks every 5 minutes if site is live; emails if down

Vercel Analytics – Shows visitor stats (optional)

Supabase Dashboard – Monitor database size and usage


## **👩‍💻 Built By**
Harshitha - Just a daughter helping her father

https://img.shields.io/badge/GitHub-harshi1111-%2523D4AF37?style=flat-square&logo=github&logoColor=white&labelColor=%25230A120A


## 🙏 Thanks To
Supabase – Free database hosting

Vercel – Free website hosting

Tesseract.js – Open-source OCR library

Tailwind CSS – Makes styling easy

My father – For trusting me to build this


<div align="center">
This project is private to our family. Not for commercial use.

<br />
<sub>Last updated: March 2026</sub>

</div> ```
