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

#### Normal Case: Sequential Processing
**Settings:**
- Period 1: `09:00-12:00` with filter `"meetings"`
- Period 2: `13:00-17:00` with filter `"code"`

**Tasks:** 2 with "meetings", 2 with "code"

**Result:**
```
09:00 - Meeting task 1
09:45 - Meeting task 2
13:00 - Code task 1
13:45 - Code task 2
```

#### Edge Case: Non-Chronological Order
**Settings:**
- Period 1: `14:00-17:00` with filter `"urgent"`
- Period 2: `09:00-17:00` with filter `"routine"`

**Tasks:** 1 with "urgent", 2 with "routine"

**Result:**
```
09:00 - Routine task 1  (Period 2 processed second, but fills earliest available time)
09:45 - Routine task 2
14:00 - Urgent task 1   (Period 1 processed first)
```

Period 1 processes first (placing "urgent" at 14:00), then Period 2 finds slots at 09:00-14:00 and 14:45-17:00 (excluding 14:00-14:45 used by Period 1).

#### Edge Case: Overlapping Periods
**Settings:**
- Period 1: `09:00-12:00` with filter `"admin"`
- Period 2: `09:00-17:00` with no filter

**Tasks:** 1 with "admin", 5 general tasks

**Result:**
```
09:00 - Admin task      (Period 1)
09:45 - General task 1  (Period 2, fills 09:45-12:00)
10:30 - General task 2
11:15 - General task 3
12:00 - General task 4  (Period 2, fills 12:00-17:00)
12:45 - General task 5
```

Period 2 sees the full 09:00-17:00 range, but slot 09:00-09:45 is already used by Period 1.

#### Edge Case: Filter Excludes All Tasks
**Settings:**
- Period 1: `09:00-12:00` with filter `"starred only"` (but no tasks are starred)

**Result:** Period 1 places nothing. All tasks remain available for subsequent periods.

### Troubleshooting

#### Tasks Not Auto-Fitting

**Issue:** Filter excludes all matching tasks
- **Solution:** Check filter criteria. If "starred only" is enabled, verify tasks are actually starred. Search text is case-insensitive and matches title/description/list.

**Issue:** Filters not applying until page refresh
- **Solution:** This was a bug fixed in recent commits. Update to latest version. Filters now sync instantly between settings panel and day page.

**Issue:** No available time slots
- **Solution:** Auto-fit skips existing calendar events. If your calendar is full, manually clear space or adjust working hours to include more time.

#### Tasks Placed in Wrong Time Slots

**Issue:** Expected tasks at 10:00, but placed at 14:00
- **Cause:** Working hours are processed in settings order, not chronologically. If Period 1 is `14:00-17:00` and Period 2 is `10:00-17:00`, Period 1 processes first.
- **Solution:** This is expected behavior. To fill 10:00 first, reorder working hours in settings (10:00 period should appear before 14:00 period).

**Issue:** Tasks placed outside working hours
- **Cause:** Auto-fit only uses defined working hours. Check Settings → Working Hours.
- **Solution:** Add or adjust working hour periods to cover desired time ranges.

#### Filter Criteria Not Matching

**Search supports:**
- Multiple terms: `"task project"` matches tasks with both "task" AND "project"
- Negative terms: `"-meeting"` excludes tasks containing "meeting"
- Fields searched: title, description (notes), list name

**Example:** Filter `"urgent -email"` matches tasks with "urgent" but NOT "email" in any field.

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
