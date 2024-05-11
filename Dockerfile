FROM node:21.7.1

RUN mkdir -p /usr/src/oficina-integracao-2-api
WORKDIR /usr/src/oficina-integracao-2-api

COPY . /usr/src/oficina-integracao-2-api/

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
