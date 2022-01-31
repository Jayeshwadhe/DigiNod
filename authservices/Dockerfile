FROM node:14.9

WORKDIR /authservices/src/app

COPY package*.json ./

RUN npm install


COPY . .

CMD ["npm run start"]