# Nexora Campus Dashboard

## Overview

This dashboard is being built to manage **hackathon registrations, payments, and team verification** for Nexora.

It replaces manual Excel handling by:

- Uploading Registration Excel
- Uploading Payment Excel
- Merging both datasets
- Displaying combined data in a structured dashboard

---

## Current Features (Phase 1)

- Upload Registration Excel
- Upload Payment Excel
- Merge data based on Team Name
- Display combined data in table
- Payment status detection (Paid / Not Paid)

---

## Tech Stack

- React (Vite)
- JavaScript
- XLSX (Excel parsing)

---

## Project Structure

```bash
Nexora_Dashboard/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.jsx
│
└── README.md
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/MGurucharan/Nexora_Dashboard.git
cd Nexora_Dashboard/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the project

```bash
npm run dev
```

---

## How to Use

1. Upload **Registration Excel**
2. Upload **Payment Excel**
3. View merged data in dashboard
4. Verify payment status

---

## Important Notes

- Matching is done using **Team Name**
- Ensure team names are consistent across both Excel sheets
- Data is currently handled on frontend only

---

## Upcoming Features (Phase 2)

- Filtering (Paid / Unpaid)
- Verification toggle
- Export final Excel
- Improved UI

---

## Team Guidelines

- Do NOT push directly to `main`
- Always create a new branch:

```bash
git checkout -b feature-name
```

- Commit with clear messages:

```bash
git commit -m "added payment merge logic"
```

---

## Contribution

Coordinate before making major changes to:

- data structure
- merge logic
- UI layout

---

## Status

In Development

