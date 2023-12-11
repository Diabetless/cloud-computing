FROM ubuntu:latest

# Update and install basic tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget

# Install Node.js
ENV NODE_VERSION=18.12.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

# Install Python
RUN apt-get install -y python3 python3-pip

# Install Make
RUN apt-get install -y make

# Install GCC
RUN apt-get install -y build-essential

# Set working directory
WORKDIR /app

# (Optional) Copy your application files
COPY . .

# (Optional) Install your Node.js dependencies
RUN npm install

# Expose ports (modify based on your application)
EXPOSE 5000

# Start your application (modify based on your application)
CMD [ "npm", "run", "start"]