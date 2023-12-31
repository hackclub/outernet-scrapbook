FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

#RUN yarn
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENTRYPOINT ["./entrypoint.sh"]
