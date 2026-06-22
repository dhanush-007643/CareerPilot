# CareerPilot Production Deployment Guide

This document outlines the overarching strategies, security measures, and monitoring setups implemented to make CareerPilot production-ready.

## 1. Zero-Downtime Deployments (High Availability)
The Kubernetes deployment files are configured using a `RollingUpdate` strategy.
- `maxSurge: 1`: Allows spinning up one extra pod above the desired replica count during an update.
- `maxUnavailable: 0`: Ensures that no pods are taken down until the new pods are fully ready and passing health checks.
- This guarantees users experience zero downtime when deploying new versions.

## 2. Health Monitoring & Auto-Recovery
We utilize Kubernetes **Liveness Probes** and **Readiness Probes**.
- Both probes target the root path `/` of the backend and frontend.
- If the application deadlocks or fails to respond within the `timeoutSeconds`, Kubernetes will automatically restart the pod, ensuring "self-healing" auto-recovery without manual intervention.

## 3. Security Hardening
- **Secret Management**: Passwords, Database URIs, and JWT Secrets are stored in `k8s/secret.yaml` and injected as environment variables at runtime. They are never hardcoded into the source code or built into the Docker images.
- **Container Isolation**: Both `frontend` and `backend` images run as standard non-root processes where applicable, reducing container breakout risk.
- **Reverse Proxy**: The frontend container uses Nginx to proxy API requests internally to the backend service `http://backend-service:5001`. This prevents exposing the backend directly to the public internet.

## 4. Scalability
The architecture completely decouples the React frontend from the Node.js backend.
- The `replicas: 2` property ensures traffic is load-balanced across multiple instances of both frontend and backend out of the box.
- Using MongoDB Atlas allows the database to scale horizontally and vertically independent of the application servers.

## 5. Monitoring & Logging Setup (Next Steps)
For full observability in production, it is highly recommended to integrate the following to your cluster:
- **Prometheus & Grafana**: For visualizing CPU/Memory usage and HTTP request latency.
- **ELK Stack (Elasticsearch, Logstash, Kibana)**: To aggregate the container logs natively produced by Kubernetes (`kubectl logs`).
- **Sentry**: To catch unhandled exceptions inside the React application and Express endpoints.
