# ProfTest - Multiple Choice Test Manager

ProfTest is a Next.js web application built with TypeScript, designed to help professors create, manage, and correct multiple-choice tests efficiently. The application is fully containerized using Docker, providing a seamless development and production environment.

## 🚀 Features

- **Question Bank Management:** Create and manage a repository of multiple-choice questions. Enforces strict validation to ensure every question has a defined correct answer.
- **Test Generation:** Compile tests from the question bank. Supports dynamic PDF generation for test printouts and distribution.
- **Automated Correction:** Drag-and-drop interface for uploading student answer sheets (CSVs) and official answer keys. Automatically grades submissions, calculating final scores, pass/fail rates, and identifying students in need of recovery.

## 🗺️ System Routes

### Frontend Pages (UI)

| Route | Description |
|-------|-------------|
| `/` | **Dashboard:** Homepage providing a quick system overview and navigation to main features. |
| `/questions` | **Question Bank:** Interface to create, view, edit, and delete test questions. |
| `/tests` | **Test Management:** Interface to build test configurations and connect them with questions. |
| `/correction` | **Correction Panel:** Dashboard for grading tests. Upload CSV answer sheets to automatically calculate student grades and success metrics. |

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/questions` | `GET`, `POST` | Fetch all questions or create a new question. |
| `/api/questions/[id]` | `GET`, `PUT`, `DELETE`| Retrieve, update, or remove a specific question. |
| `/api/tests` | `GET`, `POST` | Fetch all tests or construct a new test. |
| `/api/tests/[id]` | `GET`, `PUT`, `DELETE`| Retrieve, update, or remove a specific test. |
| `/api/tests/[id]/generate`| `POST` | Trigger the generation of a test document (e.g., PDF generation). |
| `/api/correction` | `POST` | Process and evaluate student CSV answers against given keys. |

## 🛠️ Tech Stack

- **Framework:** Next.js (App Directory), React
- **Language:** TypeScript
- **Database:** SQLite with Drizzle ORM
- **Styling:** CSS Modules
- **Testing:** Jest, Cucumber (Gherkin feature tests)
- **Code Quality:** Biome (Linter/Formatter), TypeScript (tsc), Knip (Dead-code), Semgrep (Security)
- **Environment:** Docker & Docker Compose

## 🐳 Running the System Using Docker

The entire application state, including the database and dependencies, is encapsulated inside Docker.

### Prerequisites
- Docker
- Docker Compose

### 1. Build and Start the Application
Open your terminal, navigate to this project's root directory (where `docker-compose.yml` resides), and execute:

```bash
docker compose up --build
```
*(You can add the `-d` flag to run it in detached/background mode).*

### 2. Access the Platform
Once the container shows that the Next.js server has started, open your web browser and navigate to:
- **Application URL:** [http://localhost:3000](http://localhost:3000)

*Note: Volume mapping is configured in `docker-compose.yml`. Any changes you make to the files in `src/` locally will automatically trigger a hot reload in your browser.*

### 3. Stopping the Application
To shut down the container safely, use `CTRL+C` in your terminal or run this command in a new terminal window inside the root directory:

```bash
docker compose down
```

## 🧪 Testing & Code Quality

You can run the application's automated test suite (Jest and Cucumber scenarios) inside the active Docker container:

```bash
docker compose exec web npm test
docker compose exec web npm test:e2e
```
*(If your service is named differently or you are not using compose locally, you can use `docker exec -it <container_name> npm test`)*

### Static Analysis
To check for code compliance and ensure 0 errors across Biome, TypeScript, Knip, and Semgrep, run the dedicated script inside the container:

```bash
docker compose exec web npm run lint:all
```
