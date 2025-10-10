# Digital Wallet API (Bkash/Nagad‑like)

A secure, modular, role‑based backend API for a digital wallet system built with Express.js, TypeScript, and Mongoose. Users can register, get a wallet automatically, add money, withdraw, send money, and view history. Agents can cash‑in/out for users. Admins can manage users, wallets, and transactions.

## ✨ Features

- JWT authentication with three roles: ADMIN, USER, AGENT
- Secure password hashing (bcrypt)
- Auto wallet creation on registration (default balance: ৳50)
- Users:
  - Add money (top‑up), withdraw, send money
  - View transaction history (paginated, filterable)
- Agents:
  - Cash‑in (add) to any user wallet
  - Cash‑out (withdraw) from any user wallet
- Admins:
  - View all users and wallets
  - Block/unblock wallets
  - Approve/suspend agents (optional)
  - View all transactions
- Strong validations (Zod), centralized error handling
- Using UUIDs for transaction references
- Atomic balance updates using MongoDB sessions/transactions
- Clean modular architecture

## 🧱 Tech Stack

- Node.js, Express.js, TypeScript
- MongoDB, Mongoose
- JWT for auth
- Zod for validation
- bcrypt for password hashing

## 📂 Folder Structure

```
src/
├── app.ts
├── server.ts
├── app/
│   ├── errorHelper/
│   │   └── appError.ts
│   ├── interface/
│   │   └── index.d.ts               # Express type augmentation (req.user, etc.)
│   ├── middlewares/
│   │   ├── checkAuth.ts             # Role-based auth guard
│   │   ├── globalErrorHandler.ts
│   │   ├── zodValidator.ts
│   │   └── zodValidatorTransaction.ts
│   ├── modules/
│   │   ├── admin/
│   │   │   └── admin.controller.ts  # Admin-only handlers
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.service.ts
│   │   ├── transaction/
│   │   │   ├── transaction.controller.ts
│   │   │   ├── transaction.interface.ts
│   │   │   ├── transaction.model.ts
│   │   │   ├── transaction.route.ts
│   │   │   ├── transaction.service.ts
│   │   │   └── transaction.zodValidation.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.interface.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.route.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.zodvalidation.ts
│   │   └── wallet/
│   │       ├── router.ts
│   │       ├── wallet.controller.ts
│   │       ├── wallet.interface.ts
│   │       ├── wallet.model.ts
│   │       ├── wallet.service.ts
│   │       └── wallet.zodValidation.ts
│   └── Routers/
│       └── indexRouter.ts           # Aggregates all module routes under /api/v1
├── config/
│   └── env.ts
└── utils/
    ├── catchAsync.ts
    ├── jwt.ts
    ├── seedSuperAdmin.ts
    ├── sendResponse.ts
    ├── setAuthToken.ts
    └── userToken.ts
```

## 🧠 Domain Models (High‑level)

- User
  - name, email (unique), phone (unique), password, role (ADMIN/USER/AGENT), status (ACTIVE/SUSPENDED), isDeleted
- Wallet
  - userId (unique), balance (paisa), status (ACTIVE/BLOCKED), currency, isDeleted
- Transaction
  - fromWallet, toWallet, amount (paisa), fee, commission, type (TOP_UP, WITHDRAW, SEND_MONEY, CASH_IN, CASH_OUT), status (PENDING/COMPLETED/FAILED/REVERSED), description, reference, initiatedBy, agentId, metadata, timestamps

All monetary values are stored in paisa to avoid floating point errors.

## 🔐 Authentication & Authorization

- JWT stored in Authorization: Bearer <token>
- Middleware checkAuth(...roles) protects routes by role
- Passwords hashed with bcrypt

## ✅ Business Rules

- Wallet auto‑created on registration with default ৳50 (5000 paisa)
- Only ACTIVE wallets can transact
- Users cannot send money to themselves
- Atomic updates for send money and agent cash operations using mongoose sessions
- Validation for amount limits and email formats via Zod

## ⚙️ Environment Variables

Create a .env file at the project root:

```
PORT=5000
NODE_ENV=development

DATABASE_URL=mongodb://127.0.0.1:27017/digital_wallet
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Optional seed admin
SEED_ADMIN_NAME=Super Admin
SEED_ADMIN_EMAIL=admin@wallet.com
SEED_ADMIN_PHONE=01700000000
SEED_ADMIN_PASSWORD=Admin@123
```

Ensure config/env.ts reads these values.

## 🚀 Getting Started (Windows)

1. Install dependencies

```
npm install
```

2. Setup environment

- Create .env as above
- Ensure MongoDB is running locally (or update DATABASE_URL)

3. Start in development

```
npm run dev
```

4. Production build and start

```
npm run build
npm start
```

5. Seed a Super Admin (optional)

```
# If you have a script – adjust to your script name if different
npm run seed:admin
# or
npx ts-node src/utils/seedSuperAdmin.ts
```

## 📡 Base URL

```
http://localhost:5000/api/v1
```

## 🔁 API Endpoints (Summary)

Auth

- POST /auth/login — Login and receive JWT

Users

- POST /users/register — Register (wallet auto‑created)
- GET /users/admin/all-users — [ADMIN] List all users/agents (paginated)
- GET /users/admin/all-wallets — [ADMIN] List wallets (paginated, by status)
- PATCH /users/admin/wallet/:walletId/toggle-status — [ADMIN] Block/Unblock wallet
- PATCH /users/admin/agent/:agentId/toggle-status — [ADMIN] Approve/Suspend agent

Wallets

- GET /wallets/my-wallet — [USER, AGENT] Get own wallet
- GET /wallets/all — [ADMIN] Get all wallets
- PATCH /wallets/block/:walletId — [ADMIN] Block wallet
- PATCH /wallets/unblock/:walletId — [ADMIN] Unblock wallet

Transactions

- POST /transactions/add-money — [USER, AGENT]
- POST /transactions/withdraw — [USER, AGENT]
- POST /transactions/send-money — [USER]
- POST /transactions/cash-in — [AGENT] (if enabled)
- POST /transactions/cash-out — [AGENT] (if enabled)
- GET /transactions/history?page=&limit=&type=&status= — [USER, AGENT] (if enabled)
- GET /transactions/all?page=&limit=&type=&status= — [ADMIN] (if enabled)
- GET /transactions/:transactionId — [USER, AGENT, ADMIN] (if enabled)

Note: “if enabled” denotes routes present in design; ensure they’re wired in transaction.route.ts.

## 🧪 Validation

- Request validation via Zod:
  - User registration payloads
  - Transaction payloads (amount bounds, email format)
  - Pagination query params

## 🛡️ Error Handling

- Centralized error responses via globalErrorHandler.ts
- Rich AppError with status codes and messages
- Consistent sendResponse shape:
  - { success, statusCode, message, data }

## 🔄 Transaction Safety

- MongoDB sessions used for:
  - Sending money (debit + credit in one transaction)
  - Agent cash‑in/out
- Prevents partial updates and race conditions

## 📖 Example Requests

Login

```
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "user@wallet.com",
  "password": "123456"
}
```

Register

```
POST {{BASE_URL}}/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@wallet.com",
  "password": "123456",
  "phone": "01712345678",
  "role": "USER"
}
```

Add Money

```
POST {{BASE_URL}}/transactions/add-money
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "amount": 100,
  "description": "Initial top-up"
}
```

Send Money

```
POST {{BASE_URL}}/transactions/send-money
Authorization: Bearer {{SENDER_TOKEN}}
Content-Type: application/json

{
  "receiverEmail": "receiver@wallet.com",
  "amount": 50,
  "description": "For dinner"
}
```

Agent Cash‑In (if enabled)

```
POST {{BASE_URL}}/transactions/cash-in
Authorization: Bearer {{AGENT_TOKEN}}
Content-Type: application/json

{
  "userEmail": "user@wallet.com",
  "amount": 200,
  "description": "Cash deposit service"
}
```

## 🧭 Design Notes

- Keep monetary values in smallest unit (paisa)
- Use schema indexes only where necessary; avoid duplicate indexes (unique fields already create indexes)
- Reference integrity: validate wallet status before transactions
- Strict role checks via checkAuth middleware

## ✅ Readiness Checklist

- [ ] TransactionRouter exported as `TransactionRouter` in transaction.route.ts
- [ ] TransactionType includes CASH_IN and CASH_OUT
- [ ] Agent endpoints (cash‑in/cash‑out) implemented and routed (if required)
- [ ] History endpoints wired (if required by submission)
- [ ] No duplicate Mongoose indexes
- [ ] Super Admin seed tested (optional)

## 🧪 Testing & Demo

- Use Postman to document and test endpoints
- Include a short demo video:
  - Intro, folder structure
  - Auth flow (register/login)
  - User flows (add/withdraw/send/history)
  - Agent flows (cash‑in/out)
  - Admin flows (view users/wallets, block/unblock)
  - Wrap up

## 📜 License

MIT — use this project freely with attribution.

## 🙋 Support

For issues, please open an issue or contact the maintainer.
