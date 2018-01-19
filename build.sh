#!/bin/bash
#git pull
docker build . -t parrot:latest
docker stop parrot
docker rm parrot
docker run --name=parrot -p 80:3000 -d parrot:latest
docker images prune -a
