FROM node:21.7.1@sha256:b9ccc4aca32eebf124e0ca0fd573dacffba2b9236987a1d4d2625ce3c162ecc8

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
