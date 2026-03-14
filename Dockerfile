# Stage 1 - Build
FROM node:18-alpine AS nodework

WORKDIR /myapp

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN npm run build


# Stage 2 - Nginx
FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

#  Use dist instead of build
COPY --from=nodework /myapp/dist .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]