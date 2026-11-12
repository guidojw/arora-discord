FROM node:26.13.1@sha256:e18c3ccdf7d71619990b0e85639f506e2028a95410999cab24cc373cbd10e0ac

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

# Install dependencies
RUN apt-get update && apt-get install -y jq

# Node 25+ no longer bundles corepack, which provides yarn
RUN npm install -g corepack && corepack enable

WORKDIR /opt/app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn install --immutable

ARG LUNE_VERSION=0.10.5
RUN curl -L "https://github.com/lune-org/lune/releases/download/v${LUNE_VERSION}/lune-${LUNE_VERSION}-linux-x86_64.zip" -o tmp.zip && \
  unzip tmp.zip -d /usr/local/bin && \
  rm tmp.zip

# Bundle app source
COPY . .
RUN yarn build:prod

RUN chmod -R +x bin/*

CMD yarn start
