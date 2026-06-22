FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Command to run the application
CMD ["npm", "start"]
