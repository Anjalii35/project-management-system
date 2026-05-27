# Use Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy rest of the project
COPY . .

# Expose frontend dev server port (Vite = 5173, CRA = 3000)
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]