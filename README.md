# CareerPilot

CareerPilot is a full-stack MERN application for recruitment, job searching, and candidate assessments. 

## DevOps & Cloud Infrastructure

CareerPilot is fully containerized and includes a comprehensive, production-ready DevOps infrastructure. Everything from local development via Docker Compose to AWS Kubernetes deployments is supported.

### Infrastructure Guides
Please refer to the detailed guides in the `docs/` directory to configure, deploy, and manage the infrastructure:

- **[Deployment Strategy Overview](docs/deployment-guide.md)** - High-level architecture and production strategies.
- **[Docker Guide](docs/docker-guide.md)** - How to build and run the application locally using Docker and Docker Compose.
- **[Kubernetes Guide](docs/kubernetes-guide.md)** - How to deploy the application to a Kubernetes cluster for high availability.
- **[Jenkins CI/CD Guide](docs/jenkins-guide.md)** - How to configure the Jenkins automated build and deployment pipeline.
- **[AWS Deployment Guide](docs/aws-deployment-guide.md)** - Step-by-step instructions for setting up the free-tier infrastructure on Amazon Web Services.

### Environment Setup
Before deploying, make sure you configure your `.env` files. See `backend/.env.example` for the required backend variables (MongoDB connection strings, JWT secrets, etc.).