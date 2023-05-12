FROM node:18.16.0

RUN npm install -g ts-node

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

RUN  \
    groupadd app && useradd --home-dir=/app --gid=app app \
    && chown -R app:app /app
USER app

COPY . /app
