FROM node:14.16.1

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Install dependencies
WORKDIR /opt/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

RUN chmod +x ./bin/wait-for-it.sh

CMD yarn start
