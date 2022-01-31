# Stage 1
#######################################
FROM node:16.13.2-alpine as builder

# Set working directory
WORKDIR /app

# Copy package* to install npm packages
COPY package.json package.json

# Installs npm packages
RUN npm install

# Copy source files
COPY ./ ./

# Builds production build
RUN npm run build

#Stage 2
#######################################
#pull the official nginx:1.19.0 base image
FROM nginx:1.21.6-alpine

# Set working directory to nginx resources directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static resources
RUN rm -rf ./*

# Copies static resources from builder stage
COPY --from=builder /app/build .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]