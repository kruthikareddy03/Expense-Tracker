# Smart Expense Tracker – Personal Finance Management System

A full-stack, responsive **MERN (MongoDB, Express.js, React.js, Node.js)** personal finance and budget management web application developed as a modern college mini project.

---

## 🌟 Key Features

### 1. User Authentication (Login & Sign Up)
- **Secure Registration:** Create an account with Full Name, Email address, and Password with validation and confirmation.
- **Secure Login:** Authenticate with JWT (JSON Web Tokens) and bcrypt password hashing.
- **One-Click Demo Fill:** Built-in "Auto Fill" button for test account (`krithika@example.com` / `password123`) for effortless viva demonstrations.
- **Protected Routes:** Guards the financial dashboard, preventing unauthorized access when logged out.
- **User Profile Pill & Sign Out:** Displays the authenticated user's name, email, and avatar in the navigation bar and sidebar, with a one-click Sign Out button.

### 2. Dynamic Financial Dashboard
- **Real-Time Key Financial Metrics:**
  - **Total Income:** Sum of all recorded earnings.
  - **Total Expenses:** Sum of all outgoing expenditures.
  - **Available Balance:** Dynamic difference ($Income - Expenses$).
  - **Total Transactions:** Live document count.
- **Interactive Recharts Visualizations:**
  - **Monthly Cash Flow:** Grouped bar chart comparing income vs. expenses over the past 6 months.
  - **Category Breakdown:** Donut/Pie chart showing expense distribution across categories.
  - **Spending Trend:** Area chart illustrating outgoing expenditure curves with subtle gradients.
- **Recent Transactions:** Quick-access table showing the 5 most recent records with color-coded badges, timestamps, and instant actions.
- **Monthly Budget Quick Glance:** Live progress bar with status indicators.

### 2. Full-Featured Transaction Management (CRUD)
- **Add Transactions:** Seamlessly record both Income and Expenses with custom metadata.
- **View & Search:** Real-time text search by transaction title or description notes.
- **Multi-criteria Filtering:**
  - Filter by Type: *All*, *Income Only*, *Expenses Only*.
  - Filter by Category: *Food*, *Shopping*, *Transport*, *Education*, *Bills*, *Entertainment*, *Healthcare*, *Salary*, *Freelancing*, *Scholarship*, *Allowance*, etc.
  - Filter by Date Range: Custom Start Date and End Date.
- **Sorting:** Sort transactions by Date (*Newest/Oldest*) or by Amount (*Highest/Lowest*).
- **Edit & Update:** In-place modal editing with automatic form pre-population and validation.
- **Delete Confirmation:** Modal dialog to prevent accidental deletion of financial records.
- **Pagination:** Clean page controls with record counts.
- **CSV Data Export:** One-click download of all transaction records to `.csv` spreadsheet format for college demonstrations and reports.

### 3. Add Income and Expenses
- Clean segmented toggle to switch between **Expense** and **Income**.
- Field validations (Title min 2 chars, positive non-zero amount, date, required category).
- Animated feedback toasts (Success and Error alerts).
- Default Expense Categories: `Food`, `Shopping`, `Transport`, `Education`, `Bills`, `Entertainment`, `Healthcare`, `Other`.
- Default Income Categories: `Salary`, `Allowance`, `Scholarship`, `Freelancing`, `Other`.

### 4. Monthly Budgeting & Limit Alerts
- Set a spending ceiling for any target month (`YYYY-MM`).
- Real-time calculation of **Total Spent**, **Remaining Budget**, and **% Utilized**.
- Visual color-shifting progress bar:
  - 🟢 **Safe:** `< 80%` of budget utilized.
  - 🟡 **Warning:** `80% - 99%` of budget consumed.
  - 🔴 **Danger / Exceeded:** `≥ 100%` budget exceeded alert.
- Historical budget archive showing all configured spending limits.

### 5. Financial Reports & Analytics
- Monthly summary cards for **Net Savings**, **Savings Rate (%)**, and **Daily Average Expense**.
- **Highest Spending Category:** Dynamic highlight showing top expenditure driver.
- Category breakdown comparative bar chart and day-by-day spending trajectory.
- One-click **Print / PDF Report** capability.

### 6. Design & Aesthetics
- **Modern SaaS Aesthetics:** Clean white and light-gray background with emerald green accents.
- **Dark Mode Support:** Built-in dark theme toggle stored in `localStorage`.
- **Responsive Layout:** Works on Desktop, Laptop, Tablet, and Mobile screens with a collapsible sidebar.
- **Lucide React Icons:** Consistent visual indicators across every component.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React.js (v18) with Vite |
| **Routing** | React Router DOM (v6) |
| **Charts** | Recharts (Responsive SVG charts) |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Styling** | Vanilla CSS with CSS Variables & Tokens (Light/Dark themes) |
| **Backend Runtime** | Node.js (v18+) with Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Fallback Database** | Embedded In-Memory MongoDB (runs out-of-the-box if mongod is not started) |

---

## 📁 Project Structure

```
Expense Tracker/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── BudgetModal.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── TransactionModal.jsx
│   │   ├── context/            # React Context Providers
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/              # Application views
│   │   │   ├── AddExpense.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Transactions.jsx
│   │   ├── services/           # Axios API services
│   │   │   ├── api.js
│   │   │   ├── budgetService.js
│   │   │   ├── dashboardService.js
│   │   │   └── transactionService.js
│   │   ├── App.jsx             # Main Router & Layout
│   │   ├── index.css           # Modern CSS Design System & Themes
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Node.js & Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection with resilient fallback
│   ├── controllers/            # Controller business logic
│   │   ├── budgetController.js
│   │   ├── dashboardController.js
│   │   └── transactionController.js
│   ├── models/                 # Mongoose Data Schemas
│   │   ├── Budget.js
│   │   └── Transaction.js
│   ├── routes/                 # Express REST Endpoints
│   │   ├── budgetRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── transactionRoutes.js
│   ├── .env                    # Environment variables
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                 # Database seeder with realistic test data
│   └── server.js               # Main Express application server
│
├── package.json                # Root package orchestrator
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### Step 1: Clone or Navigate to the Project Folder
Open your terminal (PowerShell, Command Prompt, or Bash) in the project root:
```bash
cd "Expense Tracker"
```

### Step 2: Configure Environment Variables
Inside `server/.env`, verify or configure your MongoDB connection:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense_tracker
```
> **Note for MongoDB Atlas:** To use MongoDB in the cloud, replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_tracker?retryWrites=true&w=majority`
>
> **Zero Configuration Fallback:** If you do not have MongoDB running locally, the server automatically starts an embedded in-memory MongoDB instance so you can test immediately without installation errors!

### Step 3: Install Dependencies
Install dependencies for both the backend and frontend:

**Option A — Single Root Command:**
```bash
npm run install:all
```

**Option B — Manually in Each Folder:**
```bash
# In the server folder:
cd server
npm install

# In the client folder:
cd ../client
npm install
```

### Step 4: (Optional) Seed Sample Transactions
To preload realistic income entries, expenses across categories, and a monthly budget:
```bash
cd server
npm run seed
```

### Step 5: Start the Backend Server
In a terminal window:
```bash
cd server
npm start
```
The server will start at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

### Step 6: Start the Frontend Application
In a second terminal window:
```bash
cd client
npm run dev
```
The client will start at: `http://localhost:5173`

### Step 7: Open in Your Browser
Open your browser and visit:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📡 REST API Reference

### Authentication API (`/api/auth`)
| Method | Endpoint | Description | Body / Headers |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | `{ email, password }` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Header: `Authorization: Bearer <token>` |

### Transactions API (`/api/transactions`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/transactions` | Get paginated list of transactions | `search`, `type`, `category`, `startDate`, `endDate`, `sortBy`, `order`, `page`, `limit` |
| `GET` | `/api/transactions/categories` | Get default categories for Income & Expense | None |
| `GET` | `/api/transactions/:id` | Get single transaction by ID | None |
| `POST` | `/api/transactions` | Record a new transaction | `{ title, amount, type, category, date, description }` |
| `PUT` | `/api/transactions/:id` | Update an existing transaction | `{ title, amount, type, category, date, description }` |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | None |

### Dashboard & Analytics API (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Returns Total Income, Total Expenses, Balance, Monthly series for Bar Chart, Category breakdown for Pie Chart, and Spending Trend |
| `GET` | `/api/dashboard/reports/monthly` | Detailed monthly report by month (`?month=YYYY-MM`), savings rate, daily average, and highest expense category |

### Monthly Budget API (`/api/budgets`)
| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/budgets` | Get all saved monthly budgets | None |
| `GET` | `/api/budgets/status` | Get budget vs actual spending status | `?month=YYYY-MM` (defaults to current month) |
| `POST` | `/api/budgets` | Set or update monthly spending limit | `{ month: "YYYY-MM", amount: Number, notes: String }` |

---

## 🎓 College Viva & Project Presentation Highlights

When demonstrating this project for academic evaluation or viva:
1. **Architecture:** Explain the 3-tier MERN stack architecture (React SPA frontend $\rightarrow$ RESTful Express API layer $\rightarrow$ MongoDB Document Database).
2. **Dynamic Aggregation Pipelines:** Showcase MongoDB's `$group`, `$match`, and `$project` aggregation stages inside `server/controllers/dashboardController.js` that compute monthly sums and category percentages on-the-fly.
3. **Responsive State Management:** Demonstrate how adding a transaction on any page immediately recalculates the balance, charts, and budget threshold warnings without stale state.
4. **Resilience:** Mention the zero-crash database fallback mechanism in `server/config/db.js` which automatically engages embedded MongoDB if local MongoDB service is offline.
5. **Theme Support:** Highlight accessibility and modern user experience with the dark mode toggle powered by native CSS custom properties.

---

## 📄 License
This project is open-source and free to use for educational and learning purposes.
