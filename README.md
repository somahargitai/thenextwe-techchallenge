# Koa MongoDB API

A REST API built with Koa.js and MongoDB.

## Prerequisites

- Node.js installed
- Docker installed and running

## Setup

1. Create a `.env` file in the root directory with the following variables:

   ```bash
   PORT=3000
   MONGODB_URI=mongodb://admin:password@localhost:27017/koa_api?authSource=admin
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start MongoDB with Docker:

   ```bash
   docker-compose up -d
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## How to test

To run the test suite, use:

```bash
npm test
```

## API Documentation

The API documentation is available through Swagger UI. To access it:

1. Start the server:

   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/docs` in your browser to view the interactive API documentation.

The Swagger UI provides detailed information about all available endpoints, request/response schemas, and allows you to test the API directly from the browser.
