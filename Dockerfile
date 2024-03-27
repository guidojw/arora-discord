FROM node:20.12.0@sha256:bf0ef0687ffbd6c7742e1919177826c8bf1756a68b51f003dcfe3a13c31c65fe

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
