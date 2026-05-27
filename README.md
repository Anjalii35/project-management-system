# 📋 Project Manager App
**A Full-Stack Project Management Tool to Manage Projects, Tasks and Teams**

---

## 🚀 Overview

Project Manager App is a full-stack web application that helps teams manage their projects, tasks, and members efficiently.
It supports role-based access control, image uploads, pagination, and a clean modern UI — all containerized with Docker for easy setup.

---

## 🌟 Key Features

### 👥 Role-Based Access Control
- First user to sign up automatically becomes **Admin**
- Admin can create and manage team members
- Users can only edit/delete their own projects and tasks
- Assigned users can view projects and tasks assigned to them

### 📁 Project Management
- Create, update, delete projects with images
- Filter and search projects by title and status
- Track project status: `NOT_STARTED`, `ACTIVE`, `COMPLETED`

### ✅ Task Management
- Create tasks with priority, deadline, and assignee
- Filter tasks by status, priority, and assignee
- Assigned users can update task status

### 👤 Team Management
- Admin can add and manage team members
- Profile pictures supported for all users
- Search team members by name

### 🐳 Fully Dockerized
- One command setup with Docker Compose
- MySQL database with automatic schema creation
- No manual database setup required

---

## 🛠️ Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React + Vite + Tailwind CSS    |
| Backend      | Spring Boot 3 + Java 21        |
| Database     | MySQL 8.0                      |
| Auth         | JWT (JSON Web Tokens)          |
| Container    | Docker & Docker Compose        |

---

## 📦 How to Run

### 1️⃣ Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

That's it — no Java, Node, or MySQL installation needed!

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/Anjalii35/project-management-system.git
cd project-management-system
```

---

### 3️⃣ Launch

```bash
docker compose up --build
```

First run takes a few minutes to build. Subsequent runs are faster.

---

## 🌐 Access

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5173     |
| Backend  | http://localhost:8080     |
| Database | localhost:3307            |

---

## 🔐 Default Credentials

> The **first person to sign up** automatically becomes Admin.

| Role  | How to get it                        |
|-------|--------------------------------------|
| Admin | Sign up first on a fresh install     |
| User  | All subsequent signups are users     |

Once logged in as Admin, you can add more team members from the Team page.

---

## 🔄 Useful Commands

```bash
# Start all containers
docker compose up --build

# Stop all containers
docker compose down

# Fresh start (clears database)
docker compose down -v
docker compose up --build

# View logs
docker compose logs backend
docker compose logs frontend
```

---

## 📁 Project Structure

```
project-management-app/
├── frontend/          # React + Vite app
├── backend/           # Spring Boot app
└── docker-compose.yml # Container orchestration
```
