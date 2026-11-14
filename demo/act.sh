#!/usr/bin/env bash
# Runs one on-screen sequence for the demo recording: closes the open cut, runs each argument as a
# drive.ts command line (e.g. "type Hello there" "send" "wait 6"), then opens a cut again, even on failure.
D="bun $(dirname "$0")/drive.ts"
$D cut end
trap '$D cut start' EXIT
for step in "$@"; do
  echo "> $step"
  eval "$D $step" || exit 1
done
