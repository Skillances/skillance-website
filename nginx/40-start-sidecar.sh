#!/bin/sh
# Runs from /docker-entrypoint.d before nginx starts. Keeps the sidecar alive in the
# background and restarts it if it exits; output goes to the container log.
set -eu

(
  while true; do
    node /opt/sidecar/sidecar.mjs || true
    echo "[sidecar] exited, restarting in 2s" >&2
    sleep 2
  done
) &
