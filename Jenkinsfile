pipeline {
    agent any

    environment {
                REACT_IMAGE = "dinesh14coder/hepl:react-frontend${BUILD_NUMBER}"
                NODE_IMAGE = "dinesh14coder/citpl:node-backend${BUILD_NUMBER}"
                REGISTRY_CREDENTIALS = credentials("dock-cred")
                REACT_REPLACE="hepl:react-to-do${BUILD_NUMBER}"
                NODE_REPLACE="citpl:react-to-do${BUILD_NUMBER}"
                REMOTEUSERNAME="citpladmin"
                REMOTEIP="13.233.126.210"
                DESTINATION_PATH="/home/citpladmin/compose"
                BACKEND_ENV="backend-env-file"
                FRONTEND_ENV="frontend-env-file"
    }

        
    stages {

        stage('Checkout') {
            steps {
                sh 'ls -ltr'
				//git branch: 'main', url: 'https://github.com/url'
            }
        }


		stage('Git-leaks') {
            steps {
                sh 'gitleaks detect --source . -r Reactleaks.json -f json || true'
				// git branch: 'main', url: 'https://github.com/url'
            }
        }

        stage('Static Code Analysis') {
            environment {
                SONAR_URL = "http://localhost:9000"
            }
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_AUTH_TOKEN')]) {
                  //  sh '''
                    //    sonar-scanner \
                      //    -Dsonar.projectKey=react-todo \
                        //  -Dsonar.sources=. \
                          //-Dsonar.host.url=$SONAR_URL \
                         // -Dsonar.login=$SONAR_AUTH_TOKEN
                    //'''
                }
            }
        }
        stage('Build React Image and Transfer') {
            steps {
                //script {
                      //  sh 'docker --version'
                       // sh 'whoami'
                        //sh 'cd frontend && docker build -t ${REACT_IMAGE} .'         
                //}
                sshagent(credentials: ['server-b-ssh']) {
                    //sh '''
                        //docker save ${REACT_IMAGE} | \
                        //ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} docker load
                    //'''
                }
            }
        }

        stage('Build Node Image and Transfer') {
            steps {
                script {
                        sh 'docker --version'
                        sh 'whoami'
                       // sh 'cd backend && docker build -t ${NODE_IMAGE} .'         
                }
                //sshagent(credentials: ['server-b-ssh']) {
                  //  sh '''
                    //    docker save ${NODE_IMAGE} | \
                      //  ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} docker load
                    //'''
                }
            }
        }
        

stage('Transfer Compose & Deploy') {
    steps {
        withCredentials([
            file(credentialsId: 'backend-env-file', variable: 'BACKEND_ENV'),
       	   file(credentialsId: 'frontend-env-file', variable: 'FRONTEND_ENV')
        ]) {
          //  sshagent(credentials: ['server-b-ssh']) {
            //    sh """
              //      sed -i -E "s/hepl:.*/${REACT_REPLACE}/g" docker-compose.yaml
                //    sed -i -E "s/citpl:.*/${NODE_REPLACE}/g" docker-compose.yaml

                  //  ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} "mkdir -p ${DESTINATION_PATH}/backend"
                    //ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} "mkdir -p ${DESTINATION_PATH}/frontend"

                   // rsync -avz docker-compose.yaml \
                     //   ${BACKEND_ENV} \
                       // ${REMOTEUSERNAME}@${REMOTEIP}:${DESTINATION_PATH}/backend/

                    //rsync -avz ${FRONTEND_ENV} \
                      //  ${REMOTEUSERNAME}@${REMOTEIP}:${DESTINATION_PATH}/frontend/


                    //ssh -o StrictHostKeyChecking=no ${REMOTEUSERNAME}@${REMOTEIP} << EOF
                      //  cd ${DESTINATION_PATH}


                       // chmod 600 backend/.env
                     //   chmod 600 frontend/.env

                      //  docker compose down || true
                       // docker compose up -d
                    //EOF
                //"""
            }
        }
    }
}


        stage('Update Deployment File') {
            environment {
                GIT_REPO_NAME = "React-Node"
                GIT_USER_NAME = "dines14-coder"
		        
            }
            steps {
                withCredentials([string(credentialsId: 'hepl', variable: 'GITHUB_TOKEN')]) {
                   // sh '''
                     //   git config user.email "dvrdineshdvrdinesh728@gmail.com"
                       // git config user.name "dines14-coder"
                       // git add docker-compose.yaml
                       // git commit -m "Update deployment image to version ${BUILD_NUMBER}"
                        //git push https://${GITHUB_TOKEN}@github.com/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:main
                    //'''
                }
            }
        }


    }
}
