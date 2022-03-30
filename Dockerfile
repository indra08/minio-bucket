FROM node:14-alpine as base

RUN mkdir -p /src/node_modules && chown -R node:node /src
WORKDIR /src
RUN npm install && npm install -g nodemon && npm install @datalust/winston-seq winston
COPY package*.json ./
EXPOSE 3000

FROM base as production
ENV NODE_ENV=production
RUN npm install && npm install -g nodemon && npm install @datalust/winston-seq winston
COPY . /
CMD ["node", "bin/www"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install && npm install -g nodemon
COPY . /
CMD ["nodemon", "bin/www"]