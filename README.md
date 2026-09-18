🛡️ KasiSafe — Community Safety Platform

> *Inform · Verify · Connect*
> A mobile-first, township-focused community safety web application for real-time incident reporting, emergency SOS, and neighbourhood awareness.

[![Live Demo] (https://kasisafe.netlify.app/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Safety & Privacy](#-safety--privacy)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## 🌍 Overview

KasiSafe is a community safety and incident reporting platform designed for South African townships and urban neighbourhoods. It enables residents to:

- **Report incidents** (crime, suspicious activity, road hazards, community info) anonymously or by name
- **View a live safety map** with colour-coded markers and adjustable radius filters
- **Send a one-tap SOS** that automatically broadcasts live GPS location to up to 3 trusted contacts
- **Stay informed** through real-time community alerts within a configurable radius
- **Access area safety stats** — aggregated, privacy-safe weekly summaries for their zone

KasiSafe uses a **trusted-device authentication model** — no password required. Registration links a mobile number to a community safety profile, prioritising accessibility for users with limited data or tech literacy.

---

## ✨ Features

### 🗺️ Live Safety Map
- Colour-coded incident pins:
  - 🔴 **Crime / Dangerous** — active criminal incidents
  - 🟠 **Suspicious Activity** — unusual or concerning behaviour
  - 🟡 **Road Hazard** — accidents, blockages, potholes
  - 🔵 **Community Info** — general neighbourhood notices
  - ✅ **Resolved** — closed or addressed incidents
- Adjustable radius filter: **1 km · 3 km · 5 km · 10 km**
- Resolved incidents shown in a separate layer

### 🚨 Emergency SOS
- Single-press trigger from any screen
- Automatically sends **live GPS location** to all saved trusted contacts
- Simultaneously broadcasts a community-wide alert to the local zone
- Displays safety tips and emergency service numbers on the SOS screen

### 📋 Incident Reporting
- Report by **incident type** (crime, suspicious, road hazard, community info)
- Auto-detect or manual **location entry**
- **Severity levels**: Low (info only) · Medium (caution) · High (urgent / avoid area)
- Option to report **anonymously**
- Date & time stamping
- Reports queued for **moderator approval** before public display

### 🔔 Community Alerts
- Live feed of active incidents within **±3 km** of the user's registered zone
- Alert banner on home screen for urgent nearby incidents

### 📊 Area Safety Dashboard
- Weekly stats for the user's zone: incident count, resolved count, active count
- **Calm / Increased Awareness / High Risk** status badge
- Privacy-safe aggregation — **no exact addresses, no small-number street-level data**

### 👤 Trusted Contacts
- Save up to **3 emergency contacts** (family, friends, neighbours, CPF members)
- Contacts receive **live location** automatically on SOS trigger
- Editable at any time from the Emergency screen

### ⚙️ Admin Console
- Moderator dashboard with pending, published, resolved, and rejected queues
- Auto-flag system for reports containing prohibited content
- Broadcast panel to push zone-wide announcements

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | No framework — lightweight for low-data environments |
| **Architecture** | Progressive Web App (PWA) | Installable, mobile-first, works on slow connections |
| **Hosting** | [Netlify](https://netlify.com) | Global CDN, continuous deployment, instant rollbacks |
| **Auth Model** | Trusted Device (no password) | Mobile number + community profile |
| **Mapping** | Live Map Engine | Radius-filtered, colour-coded incident overlays |
| **Notifications** | Real-time Community Alerts | Configurable radius broadcast |
| **Moderation** | Admin Console | Pending → Published → Resolved / Rejected workflow |

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools, package managers, or server setup required

### Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/ST10369372/kasisafe.git
cd kasisafe

# 2. Open directly in browser
open index.html

# or serve with a simple local server to avoid any CORS issues:
npx serve .
# or
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Deploying to Netlify

```bash
# Option A — Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir .

# Option B — Drag & drop
# Visit https://app.netlify.com and drag the project folder onto the deploy panel

# Option C — Connect GitHub repo
# In Netlify dashboard → "Add new site" → "Import an existing project" → select this repo
# Build command: (leave empty)
# Publish directory: .
```

---

## 📁 Project Structure

```
kasisafe/
├── index.html          # Full application — all screens rendered via JS view switching
├── app.js              # Core app logic, state management, screen navigation & all feature modules
├── style.css           # Global styles, design tokens, component layouts & responsive rules
├── logo.png            # KasiSafe brand logo
└── README.md           # Project documentation
```

> KasiSafe is intentionally a **single-file application**. All screens (registration, home, map, report, alerts, SOS, area safety, admin) are rendered dynamically by `app.js` and styled by `style.css`. This keeps the project dependency-free and fast to load on limited mobile data connections.

---

## 📖 Usage Guide

### First-Time Registration

1. Open KasiSafe at [kasisafe.netlify.app](https://kasisafe.netlify.app/)
2. Enter your **full name**, **mobile number**, **email**, and **suburb / zone**
3. Tap **Register & Continue**
4. Add up to **3 trusted contacts** — name, phone number, and relationship
5. Tap **Finish Setup & Go to Home**

> ℹ️ No password is needed. KasiSafe uses a trusted-device model — your profile is tied to this device.

### Reporting an Incident

1. From the home screen, tap **Report Incident**
2. Select the **incident type**
3. Set the **location** (auto-detect or type manually)
4. Write a brief **description**
5. Choose **severity** (Low / Medium / High)
6. Optionally enable **anonymous reporting**
7. Tap **Submit Report**

> ⚠️ Reports go to moderators for review before appearing publicly. Reports naming alleged offenders, sharing private addresses, or inciting confrontation will be rejected.

### Using Emergency SOS

1. Press the **SOS button** (available from Home and Emergency screens)
2. KasiSafe immediately:
   - Sends your **live GPS location** to all trusted contacts
   - Broadcasts a **community alert** to your zone
3. The emergency screen shows **local emergency service numbers** and safety tips

### Viewing the Live Map

1. Tap **View Live Map** from the home screen
2. Use the **radius selector** (1 / 3 / 5 / 10 km) to filter nearby incidents
3. Tap any marker to see **incident details**
4. Toggle layers to show/hide resolved incidents

---

## 🔒 Safety & Privacy

KasiSafe is built around community trust. The following safeguards are built in:

| Protection | Details |
|---|---|
| **Moderation before publishing** | All reports reviewed by community moderators before going live |
| **Anonymous reporting** | Residents can report without revealing their identity |
| **Privacy-safe aggregation** | Area stats never expose exact addresses or small-count street-level data |
| **No public profiles** | User details are used only for safety alerts and never shown publicly |
| **Prohibited content** | Naming alleged offenders, publishing private addresses, and inciting confrontation are explicitly banned |

> 🚫 KasiSafe is an **awareness and reporting platform**. Do not confront, threaten, or follow suspected individuals. Always call emergency services (10111) in life-threatening situations.

---

## 🗺️ Roadmap

- [ ] **Firebase backend** — real-time database, cloud functions, persistent storage
- [ ] **Push notifications** — native mobile push via service worker
- [ ] **Offline mode** — cached map tiles and queued report submission
- [ ] **Multi-language support** — Zulu, Sotho, Afrikaans, Tswana
- [ ] **CPF / SAPS integration** — direct escalation to Community Policing Forums
- [ ] **Incident heatmap** — density visualisation for hotspot analysis
- [ ] **Verified responder badges** — CPF members and neighbourhood watch
- [ ] **SMS fallback** — report and alert delivery without data connection

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Standards

- Vanilla JS only — no frameworks or build tools
- Mobile-first CSS (design for small screens first)
- All interactive elements must be keyboard and screen-reader accessible
- No third-party analytics or tracking scripts

---

## 👤 Author

**Phathutshedzo Ramakuela**
Advanced Diploma in Application Development — IIE Rosebank College, Roodepoort, Gauteng

[![GitHub](https://img.shields.io/badge/GitHub-ST10369372-0D1B2A?style=flat-square&logo=github)](https://github.com/ST10369372)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Phathutshedzo%20Ramakuela-0A9396?style=flat-square&logo=linkedin)](https://linkedin.com/in/phathutshedzo-ramakuela-264580290)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🆘 Emergency Contacts (South Africa)

| Service | Number |
|---|---|
| SAPS (Police) | **10111** |
| Ambulance / Medical | **10177** |
| Emergency (all networks) | **112** |
| Stop Gender Violence Helpline | **0800 428 428** |
| Childline South Africa | **0800 055 555** |

---

<div align="center">

**KasiSafe** — *Safer Communities, Together.*

[🌐 Live Site](https://kasisafe.netlify.app/) · [🐛 Report a Bug](https://github.com/ST10369372/kasisafe/issues) · [💡 Request a Feature](https://github.com/ST10369372/kasisafe/issues)

</div>
