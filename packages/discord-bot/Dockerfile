FROM node:18.2.0@sha256:3e2e7e08f088c7c9c0c836622f725540ade205f10160a91dd3cc899170d410ef AS builder

# Install dependencies
WORKDIR /opt/app
ADD . .
RUN yarn install --immutable

# Bundle app source
WORKDIR packages/discord-bot
RUN yarn build:prod
RUN yarn prod-install /opt/app/build
RUN cp -r bin dist /opt/app/build


FROM node:18.2.0@sha256:3e2e7e08f088c7c9c0c836622f725540ade205f10160a91dd3cc899170d410ef

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG BUILD_HASH
ENV BUILD_HASH=$BUILD_HASH

# Copy app source
WORKDIR /opt/app
COPY --from=builder /opt/app/build .

RUN chmod +x ./bin/wait-for-it.sh

CMD yarn start
