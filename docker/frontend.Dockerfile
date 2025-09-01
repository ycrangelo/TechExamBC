FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY ../frontend/package.json ../frontend/pnpm-lock.yaml* ./

RUN pnpm install

COPY ../frontend ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
