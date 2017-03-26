#!/bin/bash

redis-server &
sherlock server --host 0.0.0.0
