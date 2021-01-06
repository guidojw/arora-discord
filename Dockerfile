FROM node:14.15.4

# Install dependencies
WORKDIR /opt/app
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

CMD node app.js
