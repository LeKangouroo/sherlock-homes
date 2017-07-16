#!/bin/bash

sherlock server \
  --cache-server-host=$CACHE_SERVER_HOST \
  --cache-server-port=$CACHE_SERVER_PORT \
  --host=$HOST \
  --port=$PORT \
  --log-email \
  --log-email-from=$LOG_EMAIL_FROM \
  --log-email-to=$LOG_EMAIL_TO \
  --log-email-host=$LOG_EMAIL_SMTP_HOST \
  --log-email-user=$LOG_EMAIL_SMTP_USER \
  --log-email-pass=$LOG_EMAIL_SMTP_PASS
