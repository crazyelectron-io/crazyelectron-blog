# Build Stage
FROM --platform=linux/amd64 node:lts-alpine as build-stage

ENV NODE_ENV=production
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV APP_HOME=/usr/src/app

RUN mkdir -p $APP_HOME

COPY . $APP_HOME

RUN cd $APP_HOME && yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

WORKDIR $APP_HOME

RUN yarn run generate

# Production Stage
FROM --platform=linux/amd64 nginx:stable-alpine as production-stage 

ENV APP_HOME=/usr/src/app
ENV NODE_OPTIONS="--openssl-legacy-provider"

COPY --from=build-stage $APP_HOME/dist /usr/share/nginx/html

RUN chown nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
