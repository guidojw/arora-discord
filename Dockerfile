FROM node:26.12.0@sha256:1b84b89ada025e3b14543cbb837ffaa1c1b5273b841c5b94dd1a8f9c1d8cf7fe

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

ARG LUNE_VERSION=0.10.5
RUN curl -L "https://github.com/lune-org/lune/releases/download/v${LUNE_VERSION}/lune-${LUNE_VERSION}-linux-x86_64.zip" -o tmp.zip && \
  unzip tmp.zip -d /usr/local/bin && \
  rm tmp.zip

# Bundle app source
COPY . .
RUN yarn build:prod

RUN chmod -R +x bin/*

CMD yarn start
