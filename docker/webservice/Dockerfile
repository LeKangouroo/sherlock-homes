FROM node:8

LABEL maintainer "Itadakimas"

RUN npm install -g sherlock-homes phantomjs@2.1.7

COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
