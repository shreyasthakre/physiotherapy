# Single container: builds the React app, then serves it from the Express API.
# Use this on AWS App Runner, ECS Fargate, Elastic Beanstalk (Docker), or EC2.

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci

COPY backend ./backend
COPY frontend ./frontend

RUN npm run build --workspace frontend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --omit=dev --workspace backend && npm cache clean --force

COPY backend ./backend
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 4000
CMD ["node", "backend/src/index.js"]
