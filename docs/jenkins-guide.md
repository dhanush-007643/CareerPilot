# Jenkins CI/CD Pipeline Guide

CareerPilot includes a declarative `Jenkinsfile` for automated Continuous Integration and Continuous Deployment (CI/CD) to Kubernetes.

## Pipeline Architecture
1. **Checkout Source Code**: Pulls the latest code from the repository.
2. **Install Dependencies & Validate**: Runs `npm ci` for both frontend and backend to verify `package-lock.json` integrity.
3. **Run Frontend Build**: Executes Vite build process. If this fails, the deployment halts.
4. **Docker Image Build**: Builds production Docker images for both services.
5. **Docker Image Push**: Authenticates with Docker Hub and pushes the images tagged with the Jenkins `BUILD_ID`.
6. **Kubernetes Deployment**: Connects to the K8s cluster, injects the new image tags into the deployment YAML files, and applies them.
7. **Deployment Verification**: Waits for the rolling update to complete. If it hangs or crashes, Jenkins will trigger the `failure` post-step.
8. **Rollback**: Automatically issues `kubectl rollout undo` if the deployment fails.

## Jenkins Setup Requirements

### 1. Plugins Needed
- **Docker Pipeline Plugin**: For `docker.build` and `docker.withRegistry`.
- **Kubernetes CLI Plugin**: For `withKubeConfig`.

### 2. Jenkins Credentials
You must configure the following credentials inside Jenkins (Manage Jenkins -> Credentials):

- **`docker-hub-credentials`**: "Username with password" type. Contains your Docker Hub username and password/access token.
- **`k8s-config`**: "Secret file" type. Upload your Kubernetes `~/.kube/config` file so Jenkins can communicate with your cluster.

### 3. Pipeline Configuration
- Create a new "Pipeline" job in Jenkins.
- Point the pipeline source to your Git repository containing CareerPilot.
- Jenkins will automatically detect the `Jenkinsfile` at the root of the project and execute it upon new commits.

## Modifying the Pipeline
If you use a private registry (like AWS ECR) instead of Docker Hub, update the `DOCKER_IMAGE_FRONTEND` variables and the `docker.withRegistry` endpoint in the `Jenkinsfile`.
