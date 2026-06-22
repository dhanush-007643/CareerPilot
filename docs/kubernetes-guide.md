# Kubernetes Deployment Guide

This guide explains how to deploy CareerPilot to a Kubernetes cluster using the provided manifests in the `k8s/` directory.

## Architecture
- **Namespace**: `careerpilot`
- **Frontend**: 2 Replicas, exposed via ClusterIP service, served by Nginx.
- **Backend**: 2 Replicas, exposed via ClusterIP service, Node.js REST API.
- **ConfigMap**: Holds non-sensitive environment variables (e.g., ports).
- **Secret**: Holds base64-encoded sensitive variables (e.g., MongoDB URI, JWT Secrets).
- **Ingress**: Nginx ingress controller routes `/api` traffic to the backend, and `/` to the frontend.

## Prerequisites
- A running Kubernetes Cluster (EKS, AKS, GKE, Minikube, or K3s).
- `kubectl` configured to communicate with your cluster.
- Nginx Ingress Controller installed in the cluster.

## Deployment Steps

1. **Configure Secrets**
   Open `k8s/secret.yaml` and replace the placeholder values with your actual base64 encoded secrets.
   To encode a value to base64 on Linux/Mac:
   ```bash
   echo -n "your_secret_string" | base64
   ```

2. **Apply Configurations**
   Create the namespace, configmaps, and secrets first:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   ```

3. **Deploy the Services & Applications**
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/backend-service.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/frontend-service.yaml
   ```

4. **Setup Ingress Routing**
   *Note: Edit `k8s/ingress.yaml` to replace `careerpilot.local` with your actual domain name.*
   ```bash
   kubectl apply -f k8s/ingress.yaml
   ```

## Verification
Check the status of the deployment:
```bash
kubectl get all -n careerpilot
```

Test the health probes (Liveness & Readiness):
```bash
kubectl describe pods -n careerpilot -l app=backend
```

## Scaling and Self-Healing
If you need more resources to handle traffic, you can seamlessly scale the deployments:
```bash
kubectl scale deployment careerpilot-backend --replicas=4 -n careerpilot
```
If a pod crashes or becomes unresponsive, Kubernetes will automatically restart it based on the liveness probe configuration.
