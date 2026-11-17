# Docker Deployment

## General Docker Deployment Instructions

For all Docker containers, including the dev build and the main build, you will need to do the following:

- Pull the ```docker-compose.yaml``` from the Github branch that you want to deploy on.

- Fill out ```.env``` with secrets in the environment where you are running your docker container. To find which secrets to fill out, reference ```.env.example```.

### Execute the following in the root of the project:

- If in *dev*, to use the ```docker-compose.yaml```, change the 
