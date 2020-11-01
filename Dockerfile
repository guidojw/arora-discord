FROM node:14.15.0

# Install dependencies
WORKDIR /opt/app
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

CMD node app.js
