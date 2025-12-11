FROM node:lts-alpine

# Set working directory
WORKDIR /src

COPY package*.json ./

RUN npm install --force

COPY . .

# Install dependencies
RUN npm install

# Build the project ( TypeScript build)
RUN npm run build

# Expose port your app listens on
EXPOSE 8080

# Run the production script
CMD ["npm", "start"]
