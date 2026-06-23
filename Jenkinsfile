pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_IMAGE_FRONTEND = 'dhaanush19/careerpilot-frontend'
        DOCKER_IMAGE_BACKEND = 'dhaanush19/careerpilot-backend'

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

    }

    post {
        success {
            echo 'Deployment successful! Notifying team...'
            // Add slackSend or email integration here
        }

    }
}
