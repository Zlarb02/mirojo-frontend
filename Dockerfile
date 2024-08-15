# Use the official Node.js image as the build stage
FROM node:18 AS build-stage

# Set the working directory
WORKDIR /app

# Copy all files to the working directory
COPY . .

# Install dependencies and build the application
RUN npm install && \
    npm run build && \
    rm -rf /app/node_modules

# Use the official Nginx image for the production stage
FROM nginx:stable

# Copy built files from the build stage to Nginx HTML directory
COPY --from=build-stage /app/dist/mirojo-frontend/browser /usr/share/nginx/html

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]