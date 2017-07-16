#!/bin/bash

redis-server &
sherlock server \
  --host $HOST \
  --log-email \
  --log-email-from=$LOG_EMAIL_FROM \
  --log-email-to=$LOG_EMAIL_TO \
  --log-email-host=$LOG_EMAIL_SMTP_HOST \
  --log-email-user=$LOG_EMAIL_SMTP_USER \
  --log-email-pass=$LOG_EMAIL_SMTP_PASS
