# Utiliser l'image officielle de Node.js pour la phase de build
FROM node:20 AS build-stage

# Installer pnpm globalement AVANT de l'utiliser
RUN npm install --ignore-scripts -g corepack && corepack enable && corepack prepare pnpm@latest --activate
# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances avec pnpm
RUN pnpm install --frozen-lockfile

# Copier le reste du code source
COPY . .

# Construire l'application
RUN pnpm build

# Supprimer node_modules pour réduire la taille de l'image
RUN rm -rf node_modules

# Utiliser l'image officielle de Nginx pour la phase de production
FROM nginx:stable

# Copier les fichiers construits depuis la phase de build vers Nginx
COPY --from=build-stage /app/dist/mirojo-frontend/browser /usr/share/nginx/html

# Copier le fichier de configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]
