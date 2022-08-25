FROM node:18.8.0@sha256:a0a2fc4435b0c9ae7bec0a69b1279323a4a41c5a005581fbf30d39cd5777db37

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

# Install dependencies
WORKDIR /opt/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

# Bundle app source
COPY . .
RUN yarn build:prod

RUN chmod +x ./bin/wait-for-it.sh

CMD yarn start
