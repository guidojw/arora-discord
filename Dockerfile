FROM node:26.7.0@sha256:bde0dae02f2b12d2bce5ee72b2432f0e511767b7b2dc4dd3b064df11ae422fee

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
