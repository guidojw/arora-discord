FROM node:25.9.0@sha256:78839ac448c23517f8eab2e8f7943d9b4f73979eb7f8bed2c73dbf72ff869e7b

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

# Install dependencies
RUN apt-get update && apt-get install -y jq

WORKDIR /opt/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

ARG LUNE_VERSION=0.10.4
RUN curl -L "https://github.com/lune-org/lune/releases/download/v${LUNE_VERSION}/lune-${LUNE_VERSION}-linux-x86_64.zip" -o tmp.zip && \
  unzip tmp.zip -d /usr/local/bin && \
  rm tmp.zip

# Bundle app source
COPY . .
RUN yarn build:prod

RUN chmod -R +x bin/*

CMD yarn start
