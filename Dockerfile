FROM node:16-alpine as build

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

WORKDIR /app

COPY . .

RUN apk add python3 build-base
RUN yarn && yarn build && npm prune --production

FROM nginx:1.24-alpine

WORKDIR /usr/share/nginx/html

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache bash

COPY --from=build /app/dist .
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/gzip.conf /etc/nginx/conf.d/gzip.conf
COPY ./.env.sh ./.env.sh

EXPOSE 80

ENTRYPOINT ["/bin/bash", "-c", "./.env.sh && nginx -g \"daemon off;\""]