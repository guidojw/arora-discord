FROM node:20.2.0@sha256:14f0471d0478fbb9177d0f9e8c146dc872273dcdcfc7fea93a27ed81fc6b0e96

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
