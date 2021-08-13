#!/bin/bash
pm2 delete server
cd ./dist/
pm2 start server.js
