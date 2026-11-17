# Docker Deployment

## General Docker Deployment Instructions

For all Docker containers, including the dev build and the main build, you will need to do the following:

- Pull the ```docker-compose.yaml``` from the Github branch that you want to deploy on.

- Fill out ```.env``` with secrets in the environment where you are running your docker container. To find which secrets to fill out, reference ```.env.example```.

### Execute the following in the root of the project for development or deployment:

#### For deployment to production
Run the command:
```sh
docker compose up -d ohana
```
This will deploy a secure server that you may use to publicly host the website on. It is not a development server, so if there are errors or warnings, they will be obtuse and unreadable. The code will not be easily understood if inspected. **Do not use this container for development**. 

The container has the following benefits:
- It is vastly more secure and ready for scale than the development container.
- It is far more performant.

#### For development
Run the command:

```sh
docker compose up -d ohana-dev
```

This will deploy a secure server that you may access on ```localhost:3000```. **Do not use this for deployment.**

The dev container has the following benefits:

- It reacts in real time to changes to the website.
- It broadcasts readable, legible errors.
- The code is easy to read with DevTools.

**DO NOT USE THIS CONTAINER FOR DEPLOYMENT.**