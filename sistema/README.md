# ProfTest - Multiple Choice Test Manager

A Next.js web application with TypeScript and API Routes, configured to run entirely within Docker. It is designed to help professors create and correct tests for their students.

## Prerequisites
- Docker
- Docker Compose

## Running the Application

1. Open your terminal and navigate to this `sistema` directory.
2. Build and start the Docker container using Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Once the container is running, open your web browser and navigate to:
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Route:** [http://localhost:3000/api/hello](http://localhost:3000/api/hello)

## Running Tests

To run the Jest and Cucumber (Gherkin) tests inside your running Docker container, execute:

```bash
docker compose exec web npm test
```

This ensures that testing is performed in the very same environment where dependencies were built and installed.

## Development
- The `docker-compose.yml` file maps your local files into the container.
- Any changes you make to the files in `src/` will automatically trigger a hot reload in your browser.
- Dependencies are installed automatically inside the Docker image when building.

## Stopping the Application
To shut down the container safely, use `CTRL+C` in your terminal or run this command in a new terminal window inside the `sistema` directory:

```bash
docker compose down
```