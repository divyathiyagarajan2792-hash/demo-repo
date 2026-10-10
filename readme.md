# MERN Todos

Todo app: React (Vite) frontend, Express + MongoDB backend, one Vercel deployment.

## Structure

```
frontend/   React app (Vite). Dev server proxies /api to localhost:5000.
backend/    Express API + Mongoose model. Endpoints: GET/POST /api/todos, PATCH/DELETE /api/todos/:id
vercel.json Routes /api/* to backend/server.js, everything else to the built frontend.
```

## Run locally

```bash
# 1. Backend — needs MongoDB running locally, or set MONGO_URI first
cp backend/env.example backend/.env   # then edit MONGO_URI
cd backend && npm install && npm run dev

# 2. Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## Deploy to Vercel

1. Put your database somewhere reachable (free: [MongoDB Atlas](https://www.mongodb.com/atlas), allow all IPs `0.0.0.0/0` in Network Access).
2. `npm i -g vercel`, then `vercel` from the repo root.
3. In the project dashboard → Settings → Environment Variables, add `MONGO_URI` with your Atlas connection string.
4. Redeploy (any push, or `vercel --prod`).

Never commit `.env` — add it to `.gitignore`.
