<p align="center">
  <img src="./assets/cat.svg" width="300" height="200" alt="Nest Logo" />
</p>

<p align="center">An application to manage har cases for your project, contains client and server.</p>

<p align="center">
  <a href="https://github.com/nestjs/nest" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-Nest-red" alt="Nest" />
  </a>
  <a href="https://github.com/typeorm/typeorm" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-TypeORM-orange" alt="TypeORM" />
  </a>
  <a href="https://graphql.org/" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-GraphQL-pink" alt="GraphQL" />
  </a>
  <a href="https://www.mongodb.com/" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-mongoDB-green" alt="mongoDB" />
  </a>
  <a href="https://reactjs.org/" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-React-blue" alt="React" />
  </a>
  <a href="https://chakra-ui.com/" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-CHakraUI-green" alt="CHakraUI" />
  </a>
  <a href="https://www.apollographql.com/docs/react/get-started/" target="_blank">
    <img src="https://img.shields.io/badge/dependencies-ApolloClient-blue" alt="ApolloClient" />
  </a>
  <img src="https://img.shields.io/badge/dependencies-Typescript-blue" alt="Typescript" />
</p>

## Description💬

Write in Typescript.

Server: [Nest](https://github.com/nestjs/nest) + [TypeORM](https://github.com/typeorm/typeorm) + [GraphQL](https://graphql.org/) + [mongoDB](https://www.mongodb.com/)

Client: [React](https://reactjs.org/) + [Chakra UI](https://chakra-ui.com/) + [Apollo Client](https://www.apollographql.com/docs/react/get-started/)

## Installation🍉

```bash
# keep code style
$ yarn install

# server
$ cd app/server

$ yarn install

$ cd -

#client
$ cd app/client

$ yarn install

$ cd -
```

## Running the app🚂

> before start the app, you need install [mongoDB](https://www.mongodb.com/) to store the data, greatly suggest to install it through docker. The default port is 27017, you can modify it in app/server/.env(prod mode) or .env.development(dev mode).

```bash
# start server
$ cd app/server

$ yarn start:dev

$ cd -

# start client
$ cd app/client

$ yarn start

$ cd -
```

Then it will open [localhost:3000](localhost:3000) automatically and enjoy your use.

## Use in Docker👍(Recommended)

A very simple way to use and deploy this app.

```bash
$ docker build -t har-test .

$ docker run -dit --name="har-test" -p 3000:3001 har-test
```

## QA✋

when use docker, you may meet the following questions.

> **1.unable to connect to the database**

This may appear when mongoDB and the app all start by docker. You need to set the network bridge for the two containers manually.

For example: suppose your mongoDB container named `mongo`

```bash
# create a network bridge
$ docker network create my-net

$ docker network connect my-net mongo

$ docker network connect my-net har-test

# check if the two containers are all in the network bridge
$ docker network inspect my-net
```

And then restart your containers.

## More Support

Any other questions please use [Google](https://www.google.com) or contact Kira or Okami-fay😎😎😎😎😎.
