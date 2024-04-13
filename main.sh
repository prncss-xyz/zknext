#!/bin/bash -e

/usr/sbin/sshd

exec "$@"
