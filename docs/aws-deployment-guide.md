# AWS Free Tier Deployment Guide

This guide walks you through deploying CareerPilot to AWS utilizing the Free Tier.

## Architecture Selection
Since managed Kubernetes (Amazon EKS) is **not** covered under the AWS Free Tier, we will deploy a lightweight Kubernetes distribution (**K3s**) onto an EC2 `t2.micro` instance.

## Step 1: EC2 Setup
1. Log into your AWS Console and navigate to EC2.
2. Click **Launch Instance**.
3. **AMI**: Select **Ubuntu 22.04 LTS** (Free Tier eligible).
4. **Instance Type**: Select `t2.micro` (Free Tier eligible).
5. **Key Pair**: Create a new key pair (e.g., `careerpilot-key.pem`) and download it securely.
6. **Network Settings**:
   - Allow SSH traffic from anywhere.
   - Allow HTTP traffic from the internet.
   - Allow HTTPS traffic from the internet.
   - Custom TCP rule: Port 8080 (for Jenkins if hosting on the same machine).
7. **Storage**: Set to 30 GB gp2 (Free Tier max is 30GB).
8. Launch the instance.

## Step 2: Install Dependencies (Docker & K3s)
SSH into your instance:
```bash
ssh -i "careerpilot-key.pem" ubuntu@<your-ec2-public-ip>
```

**Install Docker:**
```bash
sudo apt update
sudo apt install docker.io -y
sudo usermod -aG docker ubuntu
```

**Install K3s (Lightweight Kubernetes):**
```bash
curl -sfL https://get.k3s.io | sh -
# Allow your user to use kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown ubuntu:ubuntu ~/.kube/config
```

## Step 3: AWS Elastic Container Registry (ECR)
While Docker Hub is great, AWS ECR offers 500MB free storage per month.
1. Navigate to ECR in the AWS Console.
2. Create two private repositories: `careerpilot-backend` and `careerpilot-frontend`.
3. In Jenkins or GitHub Actions, authenticate using the AWS CLI and push your built images here. Update your Kubernetes manifests (`k8s/*-deployment.yaml`) to point to the ECR URIs.

## Step 4: MongoDB Atlas
Running a database on a `t2.micro` alongside your application will consume too much memory. 
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a Free Cluster (M0).
2. Under Network Access, allow access from anywhere (`0.0.0.0/0`) or specifically your EC2's IP.
3. Grab the connection string, base64 encode it, and place it in your `k8s/secret.yaml` under `MONGO_URI`.

## Step 5: Jenkins Installation (Optional)
If you wish to host Jenkins on the same machine (warning: `t2.micro` has only 1GB RAM, Jenkins can be heavy):
```bash
sudo apt install default-jre -y
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins -y
sudo systemctl start jenkins
```

## Step 6: Deploy to K3s
Clone your repository onto the EC2 instance (or let your CI/CD handle it):
```bash
git clone <your-repo>
cd careerpilot
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

Wait a few minutes and navigate to your EC2's Public IPv4 DNS in a browser. CareerPilot will be live!
