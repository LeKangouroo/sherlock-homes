FROM node:6

LABEL maintainer "Itadakimas"

RUN apt-get update && \
    apt-get install -y redis-server

RUN npm install -g sherlock-homes phantomjs@2.1.1

COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
