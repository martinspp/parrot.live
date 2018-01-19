#!/bin/bash
git fetch --all
git reset --hard origin/master
docker build . -t parrot:latest
docker stop parrot
docker rm parrot
docker run --name=parrot -p 80:3000 -d parrot:latest
docker images prune -a
