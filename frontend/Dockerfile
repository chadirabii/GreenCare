# --- Build Stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Clean install exact dependencies
RUN npm i

# Copy all source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# --- Nginx Stage ---
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*

# Copy React build folder to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
