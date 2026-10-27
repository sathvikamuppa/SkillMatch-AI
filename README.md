# SkillMatch AI

An AI-assisted skill analysis application that helps users compare their skills against job requirements and understand areas for improvement.

## Features

- Analyze skills against a job description.
- Generate a skill match score.
- Identify matching skills and missing skills.
- Save analysis results in a database.
- View previous analyses.

## Tech Stack

**Frontend:** React, TypeScript, Vite

**Backend:** Java, Spring Boot, Maven

**Database:** MySQL

## Project Structure

```text
SkillMatch-AI/
└── SkillMatch 3/
    ├── frontend/
    ├── backend/
    ├── schema.sql
    └── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Java 21 or compatible JDK
- MySQL

### 1. Set up the database

Create the MySQL database and configure the database connection using the instructions in the backend configuration and `schema.sql`.

### 2. Run the backend

Open a terminal in the backend directory and run:

```bash
./mvnw spring-boot:run
```

The backend runs at `http://localhost:8081` when using the default configuration.

### 3. Run the frontend

Open another terminal in the frontend directory and run:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| POST | `/api/analyses` | Submit a skill analysis |
| GET | `/api/analyses` | Retrieve saved analyses |

## Note

Configure your own database credentials before running the application. Do not commit passwords, API keys, or other secrets to GitHub.

## Author

**Sathvika Muppa**

GitHub: [@sathvikamuppa](https://github.com/sathvikamuppa)
