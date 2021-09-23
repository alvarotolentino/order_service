FROM node:14.15.4-alpine
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm install -g nodemon
RUN npm ci --silent

COPY . ./

ENTRYPOINT [ "npm", "start" ]