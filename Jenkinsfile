pipeline {
    agent any

    environment {
                REACT_IMAGE = "dinesh14coder/hepl:react-to-do${BUILD_NUMBER}"
                REPLACE="hepl:react-to-do${BUILD_NUMBER}"
                REMOTEUSERNAME="citpladmin"
                REMOTEIP="13.233.126.210"
                DESTINATION_PATH="/home/citpladmin/compose"
    }

        
    stages {

        stage('Checkout') {
            steps {
                sh 'ls -ltr'
            }
        }

        stage('Static Code Analysis') {
            environment {
                SONAR_URL = "http://localhost:9000"
            }
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_AUTH_TOKEN')]) {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=react-todo \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_URL \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                    '''
                }
            }
        }
        stage('Build Image and Transfer') {
            steps {
                script {
                        sh 'docker --version'
                        sh 'whoami'
                        sh 'cd daily_app && docker build -t ${REACT_IMAGE} .'         
                }
                sshagent(credentials: ['server-b-ssh']) {
                    sh '''
                        docker save ${REACT_IMAGE} | \
                        ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} docker load
                    '''
                }
            }
        }

        stage('Transfer Compose & Deploy') {
            steps {
                sh 'sed -i -E "s/hepl:.*/${REPLACE}/g" docker-compose.yaml'
                sh "ls -ltr"
            }
            steps {
                sshagent(credentials: ['server-b-ssh']) {
                    sh '''
                        rsync -avz docker-compose.yaml \
                        ${REMOTEUSERNAME}@${REMOTEIP}:${DESTINATION_PATH}
        
                        ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} << EOF
                        cd ${DESTINATION_PATH}
                        docker-compose down || true
                        docker-compose -f docker-compose.yaml up -d
                        EOF
                    '''
        }
    }
        }

        stage('Update Deployment File') {
            environment {
                GIT_REPO_NAME = "react_To_Do_list"
                GIT_USER_NAME = "dines14-coder"
		        
            }
            steps {
                withCredentials([string(credentialsId: 'hepl', variable: 'GITHUB_TOKEN')]) {
                    sh '''
                        git config user.email "dvrdineshdvrdinesh728@gmail.com"
                        git config user.name "dines14-coder"
                        git add docker-compose.yaml
                        git commit -m "Update deployment image to version ${BUILD_NUMBER}"
                        git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main
                    '''
                }
            }
        }


    }
}
