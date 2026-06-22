pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_IMAGE_FRONTEND = 'yourdockerhub/careerpilot-frontend'
        DOCKER_IMAGE_BACKEND = 'yourdockerhub/careerpilot-backend'
        KUBECONFIG_CREDENTIALS_ID = 'k8s-config'
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Validate') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Frontend Build (Validation)') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                script {
                    dockerImageFrontend = docker.build("${env.DOCKER_IMAGE_FRONTEND}:${env.BUILD_ID}", "./frontend")
                    dockerImageBackend = docker.build("${env.DOCKER_IMAGE_BACKEND}:${env.BUILD_ID}", "./backend")
                }
            }
        }

        stage('Docker Image Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${env.DOCKER_HUB_CREDENTIALS_ID}") {
                        dockerImageFrontend.push()
                        dockerImageFrontend.push('latest')
                        
                        dockerImageBackend.push()
                        dockerImageBackend.push('latest')
                    }
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                withKubeConfig([credentialsId: "${env.KUBECONFIG_CREDENTIALS_ID}"]) {
                    sh 'kubectl apply -f k8s/namespace.yaml'
                    sh 'kubectl apply -f k8s/configmap.yaml'
                    sh 'kubectl apply -f k8s/secret.yaml'
                    sh "sed -i 's|image: .*careerpilot-backend:latest|image: ${env.DOCKER_IMAGE_BACKEND}:${env.BUILD_ID}|g' k8s/backend-deployment.yaml"
                    sh "sed -i 's|image: .*careerpilot-frontend:latest|image: ${env.DOCKER_IMAGE_FRONTEND}:${env.BUILD_ID}|g' k8s/frontend-deployment.yaml"
                    sh 'kubectl apply -f k8s/backend-deployment.yaml'
                    sh 'kubectl apply -f k8s/backend-service.yaml'
                    sh 'kubectl apply -f k8s/frontend-deployment.yaml'
                    sh 'kubectl apply -f k8s/frontend-service.yaml'
                    sh 'kubectl apply -f k8s/ingress.yaml'
                }
            }
        }

        stage('Deployment Verification') {
            steps {
                withKubeConfig([credentialsId: "${env.KUBECONFIG_CREDENTIALS_ID}"]) {
                    sh 'kubectl rollout status deployment/careerpilot-backend -n careerpilot --timeout=90s'
                    sh 'kubectl rollout status deployment/careerpilot-frontend -n careerpilot --timeout=90s'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! Notifying team...'
            // Add slackSend or email integration here
        }
        failure {
            echo 'Deployment failed! Initiating rollback...'
            withKubeConfig([credentialsId: "${env.KUBECONFIG_CREDENTIALS_ID}"]) {
                sh 'kubectl rollout undo deployment/careerpilot-backend -n careerpilot || true'
                sh 'kubectl rollout undo deployment/careerpilot-frontend -n careerpilot || true'
            }
        }
    }
}
