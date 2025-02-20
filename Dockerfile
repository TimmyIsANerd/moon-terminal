FROM node:16 AS build
WORKDIR /app

COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install --legacy-peer-deps

COPY ./frontend .
RUN npm run build

FROM nginx:1.19

COPY ./frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8070
CMD ["nginx", "-g", "daemon off;"]
