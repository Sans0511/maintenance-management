# 🏢 Asset Management System

A web-based asset management application built using **Next.js**, **Node.js**, **Prisma ORM**, and **MongoDB**. It allows organizations to track assets, assign them to users, and manage asset lifecycles effectively.

## 🔗 Live Demo

🌐 [View on Vercel](https://asset-management-system-six.vercel.app/)
🔑 **Live Demo Admin Credentials:** Email: `admin@gmail.com`, Password: `Admin@0511`

🧠 [GitHub Repository](https://github.com/Sans0511/asset-management-system.git)

---

## 📦 Tech Stack

- **Next.js** `15.2.3` (App Router & Server Actions)
- **Node.js**
- **Prisma ORM**
- **MongoDB**
- **Tailwind CSS** (for UI styling)
- **Vercel** (for deployment)

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based login.
- Role-based access:
  - **Admin:** Full access to all pages and actions.
  - **User:** View assigned assets and return assets.

### 🧑‍💼 User Management

- Admin can create new users with name, email, mobile, role, and status.

### 🗂️ Asset Categories

- Define asset categories like Laptops, Phones, Accessories, etc.

### 🖥️ Asset Inventory

- Create and manage assets with name, description, and serial number.
- View all available and assigned assets.

### 🔄 Asset Assignment

- Admin can assign assets to users.
- Users can see received assets.
- Users can mark assets as returned with a reason.

---

## 📄 Pages Overview

| Page                | Role  | Description                            |
| ------------------- | ----- | -------------------------------------- |
| `/signin`           | All   | User login page                        |
| `/user`             | User  | View assigned assets and return them   |
| `/` (Dashboard)     | Admin | Admin dashboard for full asset control |
| `/users`            | Admin | Add new users                          |
| `/asset-categoty`   | Admin | Create and manage asset categories     |
| `/assets`           | Admin | Create and manage assets               |
| `/asset-assignment` | Admin | Assign assets to users                 |
| `/inventory`        | Admin | Add inventory to asset                 |

---

## 🔐 Roles & Permissions

| Feature                 | Admin | User |
| ----------------------- | :---: | :--: |
| View Assigned Assets    |  ✅   |  ✅  |
| Return Assigned Asset   |  ✅   |  ✅  |
| Assign Assets           |  ✅   |  ❌  |
| Create Asset Categories |  ✅   |  ❌  |
| Add New Assets          |  ✅   |  ❌  |
| Create Users            |  ✅   |  ❌  |
| Create Inventory        |  ✅   |  ❌  |

---

## 🚀 Getting Started Locally

This guide will help you set up the Asset Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18 or later)
- npm (Node Package Manager) or Yarn or pnpm
- MongoDB

## Installation Steps

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Sans0511/asset-management-system.git](https://github.com/Sans0511/asset-management-system.git)
    cd asset-management-system
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root directory of the project. Add the following lines, replacing the placeholder values with your actual configuration:

    ```
    DATABASE_URL="your_mongodb_connection_string"
    JWT_SECRET="your_secret_key"
    ```

    - `DATABASE_URL`: The connection string for your MongoDB database. For example: `mongodb://username:password@localhost:27017/your_database_name`
    - `JWT_SECRET`: A secret key used to sign JSON Web Tokens (JWTs) for authentication. Choose a strong, random string.

4.  **Run Prisma Migrations:**

    This step sets up the database schema.

    ```bash
    npx prisma migrate dev
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  **Access the application:**

    Open your web browser and navigate to `http://localhost:3000` to view the Asset Management System.
