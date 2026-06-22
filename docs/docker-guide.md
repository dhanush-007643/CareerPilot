# Docker & Docker Compose Guide

CareerPilot uses Docker to provide consistent development and production environments. The project uses a multi-stage build process for the frontend (React + Vite -> Nginx) and a Node.js image for the backend.

## Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

## Environment Variables
Before running the containers, ensure you have set up your `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Fill in your MongoDB Atlas URI, or leave it to use the local containerized MongoDB.

## Running the Application Locally

The easiest way to run the entire stack (Frontend, Backend, and MongoDB) is using Docker Compose.

1. **Build and start the containers in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

3. **View logs (optional):**
   ```bash
   docker-compose logs -f
   ```

4. **Access the Application:**
   - Frontend (React): [http://localhost](http://localhost)
   - Backend API: [http://localhost:5001](http://localhost:5001)

## Stopping the Application
To stop and remove the containers, networks, and volumes (excluding persistent named volumes):
```bash
docker-compose down
```

To completely wipe the database and start fresh:
```bash
docker-compose down -v
```

## Security & Best Practices
- **Never** commit your `.env` files to source control.
- The `docker-compose.yml` uses bridge networks to isolate container communication.
- The frontend is served using an Alpine-based Nginx image for a minimal attack surface and small image size.
