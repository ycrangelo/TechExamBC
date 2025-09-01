FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY ../contract/package.json ../contract/pnpm-lock.yaml* ./

RUN pnpm install

COPY ../contract ./

# Expose Hardhat node default port
EXPOSE 8545

CMD ["npx", "hardhat", "node"]
