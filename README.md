This project is a full-stack that demonstrates Ethereum wallet integration, backend API development, and smart contract interaction.
Deployed Contract address: 0x3263925Cb57481aF41e397e875E51b58897F953E

## Demo
https://github.com/user-attachments/assets/04965902-8c88-49b1-a23a-9cec0bf999af

---
## Overview
- **Frontend (React + TypeScript + ethers.js)**  
  - Connect Ethereum wallet (MetaMask).  
  - Display account ETH balance and last 10 transactions.
  - Mint tokens by smart contract interaction.
  - transfer token to other address by smart contract interaction.

- **Backend (Node.js + Express  + MongoDB Atlas)**  
  - REST API to fetch gas price, recent block number and account ETH balance.  
  - Stores account balances in MongoDB Atlas.  

- **Smart Contract (Solidity + Hardhat + OpenZeppelin)**  
  - ERC-721 implementation.  
  - Supports minting and transferring token.  
  - Deployed on Ethereum sepolia testnets.  

---
## Setup and Run locally
### 1. Clone the Repository
```bash
git clone https://github.com/ycrangelo/TechExamBC.git
cd TechExamBC
```

### 2. Frontend
```bash
cd frontend
```

- **Create .env file inside the root folder**  
  - VITE_ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY> 
  - VITE_ETHERSCAN_API="https://api.etherscan.io/v2/api?chainid=11155111" 
  - VITE_BACKEND_API=http://localhost:3000/api/get/addrInfo

run this on terminal
```bash
pnpm install
npm run dev
```

### 3. Backend
```bash
cd ../backend
```

- **Create .env file inside the root folder**  
  - ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY> 
  - ETHERSCAN_API="https://api.etherscan.io/v2/api?chainid=11155111"
  - DATABASE_URL=<YOUR_MONGODBATLAS_DB_URL>

run this on terminal
```bash
pnpm install
npx prisma generate
npx prisma db push
npm run dev
```

### 4. Smart Contract
> The contract is already deployed on a sepolia testnet, but also can run it locally.
```bash
cd ../contract
```
- **Create .env file inside the root folder**  
  - ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/<ACCESS_KEY>
  - PRIVATE_KEY=<YOUR_METAMASK_WALLET_TEST_ACCOUNT_PRIVATE_KEY>
  - ETHERSCAN_API_KEY=<YOUR_ETHERSCAN_API_KEY>
  
run this on terminal
```bash
npm install # or pnpm install
npx hardhat compile
npx hardhat node
npx hardhat ignition deploy ignition/modules/Token.ts
```

---
## Prerequisites / Dependencies

Before running the project, make sure you have the following installed:

### System
- **Node.js**
- **npm** or **pnpm** (package manager)
- **Git** (to clone the repository)

### Frontend
- React
- TypeScript
- axios
- tailwindcss
- @metamask/providers
- ethers.js
- Vite

### Backend
- Node.js + Express
- cors
- ethers.js
- MongoDB Atlas
- dotenv
- prisma
- nodemon

### Contract
- Hardhat
- Solidity
- OpenZeppelin
- Sepolia testnet (or other Ethereum testnet) for deployment. need to have atleat 0.001 SepoliaETH balance to deploy

### wallet and transactions
- MetaMask browser extension to connect wallet
- Sepolia test ETH from a faucet for testing transactions

---
## Assumptions / Decisions
- used sepolia testnet and sepoliaEth for testing Contract and transfering.
- frontend is connects to MetaMask as the primary Ethereum wallet provider.
- uses environment variables(.env) to hide senstives data and private keys.
- smart contract is emplemented as ERC721 (non - fungible tokens).
- used OpenZeppelin for base contracts and standard-compliant functionality.
- assumed that the user has Prerequisites or Dependencies installed to run it locally

---
## issues / limitations
- backend stores balances in MongoDB Atlas but not currently support real-time updates manual refresh may be required.
- Sepolia testnet is currently supported and is not configured for mainnet deployment.
- frontend only supports or redirect to MetaMask only.
- has no NFT metadata like image and description. implementation of ERC721 doesn't include metadata.
- limited showing of transaction up to 10 transactions only per user.
- mobile responsiveness is limited.
- no real-time displaying owned nft and transactions in frontend. changes may delayed by a few seconds( need to manually refresh ).
- Requires at least 0.001 SepoliaETH in the wallet to deploy or interact with the smart contract, as gas fees are needed for transactions.


