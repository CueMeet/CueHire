# Use Node.js 20 as the base image
FROM public.ecr.aws/docker/library/node:20.11.0

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn cache clean && yarn install

# Copy the rest of the application code
COPY . .

# Expose the port on which the app runs
EXPOSE 3000

# Start the development server
CMD ["yarn", "dev", "--host", "0.0.0.0"] 