# Softrams - Bulwark Reporting Application Dockerized Configuration
# Maintained by Bill Jones

# Start from Alpine Linux for smaller footprint
FROM alpine:latest

# Environmental Items
ENV NODE_VERSION=20.14.0 \
    TYPESCRIPT_VERSION=10.9.2 \
    PUPPETEER_VERSION=23.2.0 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# View template at https://github.com/nodejs/docker-node/blob/master/Dockerfile-alpine.template
# Setup Bulwark Container User
RUN addgroup -S bulwark && adduser -S bulwark -G bulwark -s /bin/sh -D bulwark

# Update Image
RUN apk upgrade --no-cache -U

# Install Required Packages to Build NodeJS and Puppeter Items
RUN apk add --no-cache --virtual .build-deps-full curl make gcc g++ python3 linux-headers binutils-gold gnupg libstdc++ chromium \
 fontconfig udev ttf-freefont fontconfig pango-dev libxcursor libxdamage cups-libs dbus-libs libxrandr \
 libxscrnsaver libc6-compat nss freetype freetype-dev harfbuzz ca-certificates libgcc py-setuptools

# Ingest the GPG Keys from https://github.com/nodejs/node#release-keys
RUN for server in keys.openpgp.org pool.sks-keyservers.net keyserver.pgp.com ha.pool.sks-keyservers.net; do \
    gpg --keyserver $server --recv-keys \
      4ED778F539E3634C779C87C6D7062848A1AB005C \
      141F07595B7B3FFE74309A937405533BE57C7D57 \
      74F12602B6F1C4E913FAA37AD3A89613643B6201 \
      DD792F5973C6DE52C432CBDAC77ABFA00DDBF2B7 \
      CC68F5A3106FF448322E48ED27F5E38D5B0A215F \
      8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
      890C08DB8579162FEE0DF9DB8BEAB4DFCF555EF4 \
      C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
      108F52B48DB57BB0CC439B2997B01419BD92F80A \
      A363A499291CBBC940DD62E41F10027AF002F8B0 && break; \
  done

# Perform nodejs installation
# https://nodejs.org/dist/v14.9.0/node-v14.9.0.tar.gz - URL for Nodejs Source Code
RUN curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz" \
 && curl -fsSLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt" \
 && curl -fsSLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.sig" \
 #&& gpg --verify SHASUMS256.txt.sig SHASUMS256.txt \
 && grep " node-v$NODE_VERSION.tar.gz\$" SHASUMS256.txt | sha256sum -c - \
 && tar -xf "node-v$NODE_VERSION.tar.gz" \
 && cd "node-v$NODE_VERSION" \
 && ./configure \
 && make -j$(getconf _NPROCESSORS_ONLN) V= \
 && make install \
 && apk del .build-deps-full \
 && cd .. \
 && rm -Rf "node-v$NODE_VERSION" \
 && rm "node-v$NODE_VERSION.tar.gz" SHASUMS256.txt.sig SHASUMS256.txt \
# Cleanup
RUN rm -f "node-v$NODE_VERSION" \
  # smoke tests
  && node --version \
  && npm --version \
# Setup for launch control of Bulwark
WORKDIR /
COPY bulwark-entrypoint /usr/local/bin/

ENTRYPOINT ["bulwark-entrypoint"]
