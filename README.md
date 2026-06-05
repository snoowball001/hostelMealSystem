# Hostel Mess Manager — Google Sheets Edition

## Files

```
hostel-mess-sheets/
├── index.html      ← Open this in your browser
├── css/style.css
├── js/app.js
├── Code.gs         ← Paste this into Google Apps Script
└── README.md
```

---

## Setup (one-time, ~5 minutes)

### Step 1 — Create the Google Sheet

1. Go to https://sheets.google.com and create a new spreadsheet
2. Name it: **Hostel Mess Manager**
3. Create 6 tabs at the bottom (click the + button):
   - `members`
   - `meals`
   - `expenses`
   - `deposits`
   - `settings`
   - `log`

---

### Step 2 — Add the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Open the `Code.gs` file from this folder and **copy all of it**
4. Paste it into the Apps Script editor
5. Click **Save** (floppy disk icon or Ctrl+S)

---

### Step 3 — Deploy as Web App

1. In Apps Script, click **Deploy → New deployment**
2. Click the gear icon ⚙ next to "Type" → select **Web app**
3. Fill in:
   - Description: `Hostel Mess API`
   - Execute as: **Me**
   - Who has access: **Anyone** *(so the website can call it)*
4. Click **Deploy**
5. Click **Authorize access** and follow the Google login prompts
6. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfyc.../exec`

---

### Step 4 — Connect the website

1. Open `index.html` in your browser
2. Paste the Web App URL into the connection box at the top
3. Click **Connect**
4. The app will auto-setup all sheet headers and load any existing data

---

## How it works

```
Browser (index.html)
       ↓ fetch()
Google Apps Script (Code.gs)  ← Acts as the backend API
       ↓ read/write
Google Sheets                 ← Your database
```

Every action (add member, log meal, add expense, deposit) is immediately saved to Google Sheets. You can open the sheet anytime to see all raw data.

---

## Re-deploying after changes

If you edit `Code.gs`, you must **create a new deployment** each time:
- Deploy → New deployment (not "Manage deployments")
- Copy the new URL and re-paste it into the website

---

## Balance Formula

```
Balance = Deposit + Expenses Paid − Meal Cost
```

| Balance | Meaning |
|---------|---------|
| Positive (+) | Member is owed money |
| Negative (−) | Member owes money |

---

## Tips

- The **Refresh** button on Dashboard re-loads all data from Google Sheets
- The URL is saved in your browser so you only enter it once
- All 6 sheet tabs are auto-created with headers on first connection
- You can share the Google Sheet with others for read-only viewing
