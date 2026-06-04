# JobFlow Copilot 🤖💼

> A high-fidelity conceptual dashboard and scheduling setup representing a secure, compliant **Human-in-the-Loop Job Application Copilot**. Built as a software engineering portfolio piece to demonstrate frontend state-management, dynamic SVG rendering, browser persistence, operating system integration scripts, and Gemini API capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack: HTML5 / CSS3 / ES6 / WebAPIs](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6-purple.svg)]()
[![Scheduler: Windows Task Scheduler / PowerShell](https://img.shields.io/badge/OS%20Scheduler-PowerShell%20%7C%20WinTask-orange.svg)]()
[![LLM: Gemini API](https://img.shields.io/badge/LLM-Gemini%20Flash%201.5-cyan.svg)]()

---

## 📖 Project Vision & Architectural Pivot

Building a fully automated background script that logs into LinkedIn or Naukri, scrapes content, and auto-submits resumes sounds ideal, but faces critical blockers in production:
1. **Severe Account Bans:** Platforms deploy sophisticated anti-bot checks (CAPTCHAs, canvas fingerprinting, velocity limits). Raw automated scrapers trigger bans, causing users to lose their profiles permanently.
2. **Dynamic DOM Layout Shifts:** Class names are randomized or updated weekly, causing static scripts to crash continuously.
3. **Deceptive Skill Injection:** Auto-tailoring skills you do not have in order to trick screening systems is highly deceptive and damages credibility during recruiter rounds.

### The "Pivot & Educate" Strategy
**JobFlow Copilot** addresses these bottlenecks by serving as a **conceptual architecture wrapper**. It implements a compliant, **Human-in-the-Loop** model. The local machine generates custom, layout-safe resume skills blocks (regex or Gemini LLM) and updates a local ledger. When manual application checkpoints are hit, the system triggers local desktop alerts so the user completes the application securely, bypassing CAPTCHAs and security checks.

---

## 🛠️ Core System Architecture

```
                                      +-------------------------------+
                                      |   Windows Task Scheduler      |
                                      | (Fires PowerShell at Log-on)  |
                                      +---------------+---------------+
                                                      |
                                                      v
                                      +---------------+---------------+
                                      |     Python Scraper Daemon     |
                                      | (Persistent Chrome Session)   |
                                      +---------------+---------------+
                                                      |
                                                      v
  +--------------------------+        +---------------+---------------+
  |   Gemini 1.5 Flash API   | <====> |    Resume Skills Adaptor      |
  | (Factual Context Match)  |        |  (Keeps Document Structure)   |
  +--------------------------+        +---------------+---------------+
                                                      |
                                                      v
  +--------------------------+        +---------------+---------------+
  |   Application Ledger     | <====> |    Desktop Notification Hub   |
  | (CSV Exporter & Logs)    |        |  (Triggered manual checks)    |
  +--------------------------+        +-------------------------------+
```

### Module Breakdown
1. **OS-Level Startup Trigger:** Integrates with the Windows Task Scheduler. Auto-generates a PowerShell script to run the runner silently in the background at logon.
2. **Resume Adaptor Engine:** Dynamically compares original resume skills against incoming job details. Supports local token matching or live context alignment using the **Gemini 1.5 Flash API**, outputting a clean skills block without altering Word doc structure.
3. **Application Tracker Ledger:** Backed by browser `LocalStorage`. Features live search queries, status filters, and an **Export to CSV** utility for career telemetry tracking.
4. **Interactive SVG Analytics Dashboard:** Visualizes application funnel success ratios using computed SVG circles (`stroke-dasharray` offsets) and charts illustrating flagging categories.
5. **Desktop Alert Portal:** Simulates background plyer alerts using custom Windows 10/11 Toast overlays accompanied by synthesized double-chime AudioContext tones.

---

## 💻 Software Engineering Highlights Showcase

This project demonstrates the following core fundamentals, making it a strong showcase for entry-level engineering roles:
* **Asynchronous Javascript & Fallbacks:** Handles API latency, payload models, and parses HTTP errors, falling back safely to local regex checks if Gemini tokens are unavailable.
* **Complex DOM & Dynamic SVGs:** Computes circle segments ($2\pi R$ formulas) on-the-fly to render clean statistical donut graphics without loading external weight libraries like Chart.js.
* **Operating System Automation:** Showcases knowledge of task scheduling parameters, persistent profile flags (`user-data-dir`), and CDP commands to bypass standard bot detection flags.
* **Local Persistence & Data Exports:** Employs base Web APIs to convert JSON tables into CSV Blobs and text strings, creating direct click-to-download anchors.
* **Premium Glassmorphic CSS:** Employs fluid grids, customizable root color tokens, backdrop blur filters, and micro-hover transitions.

---

## 🚀 Installation & Local Execution

This dashboard is a client-side web application. No complex server installations or node configurations are needed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/UdayPatnala/JobFlow.git
   cd "Job Finder"
   ```
2. **Open the interface:**
   Double-click `index.html` to open it in Chrome, Edge, or Firefox.
3. **Verify Git History:**
   Inspect current status:
   ```bash
   git status
   ```

---

## 📝 How to Use & Explore

* **Step 1: Test Skills Adaptation:** Navigate to **Resume Adaptor**, insert your skills (e.g. `Python, SQL, HTML`), paste a job description, and click **Adapt Skills Block**. Review the visual difference tags.
* **Step 2 (Optional) Enable Live Gemini LLM:** Expand the API settings, input your Gemini API Key (`AIzaSy...`), and watch the status turn `CONNECTED`. Run the adaptation again to see live AI alignment.
* **Step 3: Trigger alerts:** In **App Tracker**, fill in a job title and trigger an alert. Look at the Windows toast block sliding in on the bottom right and listen to the audio notification.
* **Step 4: Check & Export Analytics:** Review the **System Control** panel to see charts recalculate. Filter by status, search, or export the ledger as a `.csv` file.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for details.
