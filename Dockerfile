FROM node:6

LABEL maintainer "Itadakimas"

RUN npm install -g sherlock-homes && \
    sherlock server

EXPOSE 8080
