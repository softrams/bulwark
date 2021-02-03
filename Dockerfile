FROM softramsdocker/bulwark-base:latest

USER root

# Environment Arguments for Bulwark
ARG MYSQL_USER
ARG MYSQL_ROOT_PASSWORD
ARG MYSQL_DB_CHECK
ARG DB_PASSWORD
ARG DB_URL
ARG DB_USERNAME
ARG DB_PORT
ARG DB_NAME
ARG DB_TYPE
ARG NODE_ENV
ARG DEV_URL
ARG SERVER_ADDRESS
ARG PORT
ARG JWT_KEY
ARG JWT_REFRESH_KEY
ARG CRYPTO_SECRET
ARG CRYPTO_SALT

# Stage the setup to launch Bulwark
RUN mkdir -p /bulwark
COPY . /bulwark
WORKDIR "bulwark"

# Permissions for Bulwark
RUN chown -R bulwark:bulwark /bulwark

# DB Wait MySQL Status Up, requires mysql-client and python
RUN apk add --no-cache --update mysql-client \
    python2 

# Runas User
USER bulwark

# Bulwark Specific Startup
# Cleanup NPM to save some space
RUN npm install \
    && rm -rf /bulwark/.npm 

# Swap to root and delete python
USER root
# Clean up apk
RUN apk del python2

# Runas User
USER bulwark

# Running Port
EXPOSE 5000

# Launch Bulwark
CMD ["npm", "run", "start"]
