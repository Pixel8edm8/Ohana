#!/bin/sh
# 99-inject-vars.sh

# Replace the placeholder in index.html with the runtime environment variable
sed -i "s|__VITE_GOOGLE_CLIENT_ID__|${VITE_GOOGLE_CLIENT_ID}|g" /usr/share/nginx/html/index.html