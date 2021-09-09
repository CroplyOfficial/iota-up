#!/bin/bash
git stash
git pull
npm i
tsc 
pm2 delete server
cd ./dist/
pm2 start server.js
