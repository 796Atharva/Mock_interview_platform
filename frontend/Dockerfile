
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api
ARG VITE_VAPI_PUBLIC_KEY
ARG VITE_VAPI_ASSISTANT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_VAPI_PUBLIC_KEY=$VITE_VAPI_PUBLIC_KEY
ENV VITE_VAPI_ASSISTANT_ID=$VITE_VAPI_ASSISTANT_ID

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
