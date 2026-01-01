# Tasks2Cal

<div align="center">
  
  **The no-nonsense utility for Google Task timeboxing.**
  
  [Tasks2Cal](https://google-task-to-calendar-helper.vercel.app) lets you drag-and-drop tasks onto your calendar or auto-fill your day around existing meetings. Built with a "radical simplicity" aesthetic using shadcn/ui.

  <a href="https://github.com/ayip001/tasks2cal/tree/main">
    <img src="https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github" alt="GitHub Repo" />
  </a>
  &nbsp;
  <a href="https://buymeacoffee.com/angusflies">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="GPL-3.0 License" />

</div>

---

## Why I Built This
I needed a way to **automate** timeboxing. While Google Calendar lets you drag tasks manually, I wanted a utility that solves the scheduling puzzle for me—filling my free time with tasks based on my specific rules in one click.

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

## How Auto-Fit Works

### Basic Algorithm

Auto-fit fills your calendar by processing working hour periods in the order they appear in settings (not chronologically). For each period:

1. **Filter tasks** based on the period's filter criteria (if any)
2. **Find available slots** within that period, excluding existing events and placements
3. **Place tasks** at the earliest available time within those slots
4. **Mark slots as used** so they're unavailable to subsequent periods

Tasks are prioritized: starred + due date (highest) → starred only → due date only → unstarred.

### Working Hour Filters

Each working hour period can have optional filters to auto-fit specific task subsets:

- **Search text:** Match tasks by title, description, or list name (supports multiple terms and `-negative` exclusions)
- **Starred only:** Only place starred tasks in this period
- **Hide containers:** Skip parent tasks with subtasks
- **Due date:** Filter by presence/absence of due date

**Key behavior:** Filters apply per-period. A task excluded from one period can still be placed in another if it matches that period's filter.

### Examples

#### Case 1: Sequential Processing
**Settings:**
- Period 1: `09:00-12:00` with filter `"meetings"`
- Period 2: `13:00-17:00` with filter `"code"`

**Result:** Meeting tasks fill the morning, and code tasks fill the afternoon.

#### Case 2: Priority Filling (Non-Chronological)
**Settings:**
- Period 1: `14:00-17:00` with filter `"urgent"`
- Period 2: `09:00-17:00` (no filter)

**Result:** "Urgent" tasks are placed first (at 14:00), then other tasks fill the remaining gaps starting from 09:00. This happens because the algorithm processes periods in the order they appear in settings.

---

## 🧠 Advanced Usage: Rule-Based Scheduling

The real power of Tasks2Cal lies in defining **Auto-fit Rules**. You can define multiple "Working Hour" ranges with specific filters that run in sequence.

For example, you can configure your day to prioritize work, but fall back to side projects if you have free time:

1.  **11:00 - 16:00** | Filter: `"Work"`
    * *Result:* The scheduler attempts to fill this block with work tasks first.
2.  **14:00 - 17:00** | Filter: `"Side Project"`
    * *Result:* This overlaps with the first block! If you ran out of "Work" tasks by 14:00, this rule kicks in and fills the remaining 14:00-16:00 slots (plus the 16:00-17:00 hour) with "Side Project" tasks.
3.  **20:00 - 22:00** | Filter: `"Housework"`
    * *Result:* Finally, evening chores are scheduled, completely separate from your work blocks.

This "waterfall" logic ensures you always prioritize your most important work while ensuring no time slot goes to waste.

---

### Troubleshooting

- **Tasks not appearing?** Check your filters (e.g., "Starred only") and ensure your tasks match. Ensure you have available slots not occupied by existing calendar events.
- **Wrong time slots?** Auto-fit processes working hour periods in the order they appear in Settings. Reorder them if you want a specific period to be filled first.
- **Filters not matching?** Search matches title, description, and list names. Use spaces for AND logic (e.g., `task project`) and `-` to exclude (e.g., `-meeting`).

---

## Screenshots

| Month View | Day View |
|:---:|:---:|
| *Calendar picker with event dots* | *Drag tasks onto time slots* |
| ![](public/tasks2cal-screencap-calendar.avif) | ![](public/tasks2cal-screencap-tasks.avif) |

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
