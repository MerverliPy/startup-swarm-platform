FROM node:22-alpine

WORKDIR /app

COPY package.json /app/package.json
RUN npm install
RUN npm install -g @github/copilot

COPY . /app

CMD ["npm", "run", "dev"]
