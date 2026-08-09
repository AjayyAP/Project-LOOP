# Project LOOP

Project LOOP is a customer-feedback and workspace management platform built for product teams. It brings feedback from manual entry, CSV files, and sample customer channels into one workspace, then adds role-aware collaboration, analytics, and Gemini-powered customer insight tools.

## Problem it solves

Product feedback is often scattered across inboxes, app stores, forms, and team conversations. Project LOOP gives teams a shared, permission-aware place to capture feedback, prioritize it, track its status, and turn it into clear product decisions.

## Key features

- JWT-based registration, login, session restoration, and logout.
- Automatic workspace creation when a user registers; the creator becomes that workspace's Admin.
- Workspace membership and role-based access for Admin, Analyst, and Viewer roles.
- Feedback creation, editing, status updates (`NEW`, `REVIEWED`, `ACTIONED`), assignment, and deletion where permitted.
- Feedback Inbox with server-side search, filtering, sorting, theme/channel/sentiment filters, date ranges, and pagination.
- CSV feedback import with per-row validation and an import summary.
- Sample-channel import for Email, Website, Play Store, App Store, and Twitter/X, with duplicate-import protection.
- Workspace dashboard analytics for feedback volume, status, priority, sentiment, themes, and recent feedback.
- AI classification with sentiment, numeric sentiment score, theme, feature area, and concise summary.
- AI Insights for theme trends, theme volume, theme drill-down, and spike detection.
- Ask LOOP: grounded workspace questions with feedback citations.
- Voice of Customer reports with saved history, real feedback quotes, sentiment shift, copy support, and PDF export.
- Responsive interface for desktop, tablet, and mobile screens.

## Role-based access

Workspace permissions are enforced by the backend as well as reflected in the UI.

| Role | Main capabilities |
| --- | --- |
| **Admin** | Creates workspaces (global Admin), manages workspace members and roles, creates/edits/deletes feedback, assigns feedback, imports CSV/sample channels, and uses analytics and AI features. |
| **Analyst** | Views workspaces, creates and edits feedback, updates feedback status, imports CSV/sample channels, and uses dashboards and AI features. Cannot manage members, create workspaces, assign feedback, or delete feedback. |
| **Viewer** | Read-only workspace access: views feedback, dashboards, and AI features. Cannot create, edit, delete, assign, import, or manage members. |

## Demo credentials — For Evaluation Only

The following dummy accounts are present in the current evaluation database and were verified during the final review.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin123@gmail.com` | `00000000` |
| Analyst | `analyst123@gmail.com` | `11111111` |
| Viewer | `viewer123@gmail.com` | `22222222` |

These are dummy accounts created only for project evaluation. They are not personal accounts, production credentials, or suitable for real customer data.

## Evaluator quick test guide

### Admin test

1. Log in with the Admin demo account.
2. Open **My Workspaces**, then open a workspace.
3. Review the dashboard and Feedback Inbox; create or edit feedback and change its status.
4. Add a registered user by email or update a workspace member role.
5. Try CSV/sample-channel import, AI Insights, Ask LOOP, and a Voice of Customer report.
6. Confirm Admin-only member and assignment controls are available.

### Analyst test

1. Log in with the Analyst demo account and open a workspace.
2. View dashboard analytics and feedback, then create/edit feedback or change its status.
3. Open AI Insights, Ask LOOP, and the Voice of Customer report.
4. Confirm workspace creation, member management, feedback assignment, and deletion controls are unavailable.

### Viewer test

1. Log in with the Viewer demo account and open a workspace.
2. View the dashboard, feedback, AI Insights, Ask LOOP, and Voice of Customer reports.
3. Confirm feedback creation/editing/status/import controls and member management are unavailable.

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Lucide React, CSS |
| Backend | Node.js, Express, express-validator, Multer |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens, bcryptjs |
| AI | Google Gemini REST API |
| Documents | jsPDF for Voice of Customer report export |
| Deployment | Vercel frontend configuration with an SPA rewrite |

## Architecture

```text
React client (client/)
        ↓ HTTP + JWT
Express API (server/src/)
        ↓                 ↓
MongoDB via Mongoose   Google Gemini REST API
```

- `client/` contains the Vite React application, protected routes, pages, API services, and responsive styles.
- `server/` contains the Express application, route handlers, controllers, Mongoose models, validation, middleware, and AI services.

## Local setup

### Prerequisites

- Node.js 20 LTS or later
- A MongoDB deployment (local or Atlas)
- A Google Gemini API key for AI features

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Configure environment variables

Create `server/.env` from `server/.env.example`. Use your own values; never commit this file.

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=<your MongoDB connection string>
CLIENT_URL=http://localhost:5173
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=<your Gemini API key>
```

Optionally create `client/.env` for a local API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run locally

In separate terminals:

```bash
# API
cd server
npm run dev

# React client
cd client
npm run dev
```

The API health endpoint is available at `http://localhost:5000/api/health`.

### Production build

```bash
cd client
npm run build
```

## Deployment

The frontend is prepared for Vercel. Set the Vercel project's **Root Directory** to `client`.

[`client/vercel.json`](client/vercel.json) contains a catch-all rewrite to `/index.html`, which is required for direct navigation and refresh on React Router routes.

Configure production API and CORS environment values in the relevant deployment environments. Do not place secrets in the frontend.

## Validation performed

The project has been manually reviewed across Admin, Analyst, and Viewer workflows, including:

- authentication, protected routes, logout, and RBAC;
- workspace and member management;
- feedback CRUD, filtering, pagination, and status workflow;
- CSV and sample-channel import;
- dashboard and AI Insights;
- Ask LOOP grounded retrieval and citations;
- Voice of Customer report generation, saved history, and PDF export;
- frontend production build and backend JavaScript syntax/module checks.

No automated test suite is currently included.

## Known limitations

- AI features require a valid Gemini API key and are dependent on external API availability.
- CSV import currently accepts the documented feedback columns only.

## Future improvements

- Add automated unit, API, and end-to-end test coverage.
- Add real external-channel connectors in place of simulated sample imports.
- Add notifications, audit history, and richer feedback collaboration workflows.
