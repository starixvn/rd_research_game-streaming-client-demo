FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib

COPY game.conf /etc/nginx/conf.d/default.conf
COPY ./build/web-mobile/ /usr/share/nginx/html
