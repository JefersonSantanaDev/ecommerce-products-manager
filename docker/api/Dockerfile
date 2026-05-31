FROM node:22-alpine

WORKDIR /app

RUN npm install -g json-server@1.0.0-beta.15

COPY db.json /app/db.json

EXPOSE 3000

CMD ["json-server", "--watch", "/app/db.json", "--host", "0.0.0.0", "--port", "3000"]
