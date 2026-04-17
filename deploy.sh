#!/usr/bin/env bash

set -euxo pipefail

# git clone https://github.com/DaniloTato/OracleSmartRevision.git

# dependencies

sudo dnf install -y nginx nodejs npm
node --version
npm --version

# oracle linux firewall config

sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload

BUILD_DIR="dist"

NGINX_CONFIG="nginx.conf"

WEB_DIR="/var/www/omi_frontend"
NGINX_SITE="/etc/nginx/conf.d/omi_frontend.conf"

# build and deploy

npm install
npm run build

sudo mkdir -p "$WEB_DIR"
sudo rm -rf "$WEB_DIR"/*
sudo cp -r "$BUILD_DIR"/* "$WEB_DIR"
sudo cp "$NGINX_CONFIG" "$NGINX_SITE"

sudo nginx -t

sudo systemctl enable nginx
sudo systemctl restart nginx
sudo systemctl status nginx --no-pager
