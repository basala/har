FROM node:14 AS BUILD_IMAGE

WORKDIR /

COPY . .

RUN chmod +x scripts/build-app \
  && scripts/build-app

FROM mhart/alpine-node:14

WORKDIR /

# copy from build image
COPY --from=BUILD_IMAGE /app/server/dist /dist
COPY --from=BUILD_IMAGE /app/server/node_modules /node_modules
COPY --from=BUILD_IMAGE /app/server/public /public
COPY --from=BUILD_IMAGE /app/server/package.json package.json
COPY --from=BUILD_IMAGE /app/server/start.sh start.sh
COPY --from=BUILD_IMAGE /app/server/schema.gql schema.gql
COPY --from=BUILD_IMAGE /app/server/.env .env

EXPOSE 3001

CMD ["sh", "start.sh"]
