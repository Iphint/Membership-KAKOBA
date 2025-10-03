# Gunakan base image Node yang aktif
FROM node:18-alpine

# Set working directory
WORKDIR /home/node/app

# Copy file package.json dan lockfile
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy folder prisma agar tersedia sebelum generate
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy semua source code lain
COPY --chown=node:node . .

# Ubah user menjadi non-root
USER node

# Expose port
EXPOSE 3001

# Jalankan aplikasi
CMD ["node", "app.js"]
