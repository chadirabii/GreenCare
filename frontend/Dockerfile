# --- Build Stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Clean install exact dependencies
RUN npm i

# Copy all source code
COPY . .

# Build production bundle
RUN npm run build

# --- Nginx Stage ---
FROM nginx:alpine

# Remove default nginx index
RUN rm -rf /usr/share/nginx/html/*

# Copy React build folder to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
