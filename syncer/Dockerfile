FROM node:18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

COPY . .
RUN rm -rf /usr/scr/app/node_modules

RUN yarn install



ENTRYPOINT ["node", "/usr/src/app/index.js"]