FROM node:20.17.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# RUN apt-get update -y
RUN apt-get install -y ca-certificates

# Bundle app source
COPY . .

EXPOSE 80

CMD [ "npm", "start" ]