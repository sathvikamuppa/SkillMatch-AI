# SkillMatch AI

**SkillMatch AI** is a career intelligence tool that helps you understand how your skills align with a job description. Paste a job posting, enter your skills, and get an instant keyword-based match score, gap analysis, and learning recommendations — all saved to your personal history.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ (or use the included `./mvnw` wrapper) |
| Node.js | 20+ |
| npm | 10+ |
| MySQL | 8.0+ |

---

## 1. Database Setup

### Create the database

```sql
CREATE DATABASE IF NOT EXISTS skillmatch_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

Run this once in your MySQL client (`mysql -u root -p`).

> The `analyses` table is created automatically by Hibernate on first startup (`ddl-auto=update`). You can also run `schema.sql` manually.

### Configure credentials

Open `backend/src/main/resources/application.properties` and set your MySQL password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillmatch_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

> **Security note:** Never commit your password to Git. Consider using environment variables in production:
> ```properties
> spring.datasource.password=${MYSQL_PASSWORD}
> ```

---

## 2. Running the Backend

```bash
cd backend

# Using the Maven wrapper (recommended):
./mvnw spring-boot:run

# Or with Maven directly:
mvn spring-boot:run
```

The backend starts on **http://localhost:8081**

### Verify the backend is running:
```bash
curl http://localhost:8081/api/health
# Expected: {"status":"success","message":"SkillMatch backend is running!"}
```

---

## 3. Running the Frontend

```bash
cd frontend
npm install        # Only needed first time or after dependency changes
npm run dev
```

The frontend starts on **http://localhost:5173**

Open your browser at `http://localhost:5173` to use the application.

---

## 4. API Endpoints

### Health check
```
GET http://localhost:8081/api/health
```

### Run a skill analysis
```
POST http://localhost:8081/api/analyses
Content-Type: application/json

{
  "jobTitle": "Frontend Developer Intern",
  "jobDescription": "We are looking for a developer with React, TypeScript, and REST API experience...",
  "userSkills": "React, TypeScript, JavaScript, HTML, CSS"
}
```

**Response:**
```json
{
  "id": 1,
  "jobTitle": "Frontend Developer Intern",
  "matchScore": 75,
  "matchedSkills": ["React", "Typescript", "Javascript", "Html", "Css"],
  "missingSkills": ["Rest"],
  "explanation": "Keyword-based skill matching found 5 of 6 required skills...",
  "recommendations": ["..."],
  "createdAt": "2026-10-27T10:30:00"
}
```

### Retrieve recent analyses (last 10)
```
GET http://localhost:8081/api/analyses
```

---

## 5. Building for Production

### Frontend build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend JAR
```bash
cd backend
./mvnw clean package -DskipTests
# Output: backend/target/backend-0.0.1-SNAPSHOT.jar
```

Run the JAR:
```bash
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```

---

## 6. Running Tests

### Backend tests
```bash
cd backend
./mvnw test
```

> Note: Backend tests require a running MySQL instance with `skillmatch_db` configured.

### Frontend type check
```bash
cd frontend
npm run build   # tsc -b is included in the build script
```

---

## 7. Troubleshooting

### Backend won't start
- Check that MySQL is running: `mysql -u root -p`
- Verify the database exists: `SHOW DATABASES;`
- Check the password in `application.properties`
- Make sure port 8081 is not in use

### CORS errors in browser
- Ensure the backend is running on port 8081
- Ensure the frontend is running on port 5173
- CORS is configured in `CorsConfig.java` for these exact origins

### "No skill matches found"
- Enter your skills explicitly in the "Your skills" field
- The matching is keyword-based, not AI-powered
- Use common tech names: "React", "Python", "Docker", "SQL", etc.

---

## 8. How the Skill Matching Works

SkillMatch AI uses **transparent keyword-based matching** (not AI or resume parsing):

1. Both the job description and your skills are normalised to lowercase
2. A dictionary of ~100 technical and soft skills is scanned against both texts
3. Skills found in the job description that are also in your profile = **matched**
4. Skills found in the job description but not in your profile = **missing**
5. Score = `(matched / total required) × 100`

This approach is deterministic, fast, and explainable. Results are saved to MySQL and shown in your history dashboard.

---

## 9. Project Structure

```
SkillMatch/
├── backend/
│   ├── src/main/java/com/skillmatch/backend/
│   │   ├── BackendApplication.java
│   │   ├── HealthController.java
│   │   ├── AnalysisController.java
│   │   ├── CorsConfig.java
│   │   ├── dto/
│   │   │   ├── AnalysisRequest.java
│   │   │   └── AnalysisResponse.java
│   │   ├── model/
│   │   │   └── Analysis.java
│   │   ├── repository/
│   │   │   └── AnalysisRepository.java
│   │   └── service/
│   │       └── AnalysisService.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── schema.sql
└── README.md
```
