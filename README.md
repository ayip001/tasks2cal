# Tasks2Cal

<div align="center">
  
  **The no-nonsense utility for Google Task timeboxing.**
  
  [Tasks2Cal](https://google-task-to-calendar-helper.vercel.app) lets you drag-and-drop tasks onto your calendar or auto-fill your day around existing meetings. Built with a "radical simplicity" aesthetic using shadcn/ui.

  <a href="https://buymeacoffee.com/angusflies">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="GPL-3.0 License" />

</div>

---

## Why I Built This
I wanted to automate timeboxing without paying for a bloated SaaS subscription. I needed a simple way to take my Google Tasks list and physically block out time on my Google Calendar. 

This is a utility I made for myself to stop listing and start scheduling. If it helps you get organized, feel free to [buy me a coffee](https://buymeacoffee.com/angusflies)!

## Features

* **⚡ Drag & Drop Scheduling:** Drag tasks directly from your list onto 15-minute calendar slots.
* **🤖 Smart Auto-Fit:** One click fills your available time with tasks, respecting your defined working hours and skipping over existing meetings.
* **📅 Visual Overview:** Month view with event dots to see your schedule density at a glance.
* **⚙️ Customizable Working Hours:** Define exactly when you are available to work so the auto-scheduler doesn't book you at 2 AM.
* **💾 Bulk Commit:** Plan your whole day in the UI, then save everything to Google Calendar in one batch.

### Roadmap / Coming Soon
* **🌍 Timezone Support:** Better handling for cross-timezone scheduling.

---

## Screenshots

| Month View | Day View |
|:---:|:---:|
| *Calendar picker with event dots* | *Drag tasks onto time slots* |
| *(Add screenshot here)* | *(Add screenshot here)* |

---

## Self-Hosting

If you want to run this yourself or contribute, here is how to get it running locally.

### Prerequisites

* **Node.js 18+**
* **Google Cloud Project** with the following APIs enabled:
    * Google Calendar API
    * Google Tasks API
* **Upstash Redis** database (for session/caching)

### Environment Variables

Rename `.env.example` to `.env` and populate the following:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-key
REDIS_URL=redis://default:token@endpoint.upstash.io:6379

```

### Installation
1. **Install dependencies:**
```bash
npm install

```


2. **Run locally:**
```bash
npm run dev

```


3. **Open in browser:**
Visit `http://localhost:3000`

### Deploying
The easiest way to deploy is via Vercel.

---

## License
This project is open source and available under the **GPL-3.0 License**.
