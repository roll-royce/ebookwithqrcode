# Stage 1: Build the React app
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the built app with nginx
FROM nginx:alpine

# Copy the built app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]