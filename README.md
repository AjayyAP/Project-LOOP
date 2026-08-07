# Project LOOP

Project LOOP is a MERN-stack internship project, developed module by module.

## Structure

```
project-loop/
├── client/       # React + Vite application
├── server/       # Express API
└── README.md
```

## Prerequisites

- Node.js 20 LTS or later
- A MongoDB Atlas cluster

## Setup

1. In `server`, copy `.env.example` to `.env` and replace `MONGODB_URI` with your MongoDB Atlas connection string.
2. Run `npm install` in both `client` and `server`.
3. Start the API with `npm run dev` from `server`.
4. Start the client with `npm run dev` from `client`.

The API health check is available at `http://localhost:5000/api/health`.

## Available scripts

From `client`:

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

From `server`:

- `npm run dev` — start the API with automatic restarts
- `npm start` — start the API normally
