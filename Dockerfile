# Use a Node v. 16 base docker image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
# For production use:
# RUN npm ci --only=production

# Copy app source code
COPY . .

# Expose the working port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]