# Softrams - Bulwark Reporting Application Dockerized Configuration
# Maintained by Bill Jones

# Start from Alpine Linux for smaller footprint
FROM alpine:3.12.0

# Environmental Items
ENV NODE_VERSION=14.17.0 \
    TYPESCRIPT_VERSION=4.0.2 \
    PUPPETEER_VERSION=5.2.1 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# View template at https://github.com/nodejs/docker-node/blob/master/Dockerfile-alpine.template
# Setup Bulwark Container User
RUN addgroup -S bulwark && adduser -S bulwark -G bulwark

# Update Image
RUN apk upgrade --no-cache -U

# Install Required Packages to Build NodeJS and Puppeter Items
RUN apk add --no-cache curl make gcc g++ python3 linux-headers binutils-gold gnupg libstdc++ chromium \
 fontconfig udev ttf-freefont fontconfig pango-dev libxcursor libxdamage cups-libs dbus-libs libxrandr \
 libxscrnsaver libc6-compat nss freetype freetype-dev harfbuzz ca-certificates

# Ingest the GPG Keys from https://github.com/nodejs/node#release-keys
RUN for server in pool.sks-keyservers.net keyserver.pgp.com ha.pool.sks-keyservers.net; do \
    gpg --keyserver $server --recv-keys \
      4ED778F539E3634C779C87C6D7062848A1AB005C \
      94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
      71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
      8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
      C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
      C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
      DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
      A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
      108F52B48DB57BB0CC439B2997B01419BD92F80A \
      B9E2F5981AA6E0CD28160D9FF13993A75599653C && break; \
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
 && cd .. \
 && rm -Rf "node-v$NODE_VERSION" \
 && rm "node-v$NODE_VERSION.tar.gz" SHASUMS256.txt.sig SHASUMS256.txt 

# Cleanup
RUN rm -f "node-v$NODE_VERSION" \
  # smoke tests
  && node --version \
  && npm --version

# Setup for launch control of Bulwark
WORKDIR /
COPY bulwark-entrypoint /usr/local/bin/

ENTRYPOINT ["bulwark-entrypoint"]
