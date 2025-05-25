FROM node:24.0.2@sha256:7cd385e17f9d66b2c3ae40597359286073a33266db71b5f01ce2d87db81b52f7

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
