# Use the official Node.js image as the build stage
FROM node:18 AS build-stage

# Set the working directory
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml pour optimiser la mise en cache des dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec pnpm
RUN pnpm install --frozen-lockfile

# Copier le reste du code source
COPY . .

# Construire l'application
RUN pnpm build
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