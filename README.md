![TheNextWe Logo](assets/thenextwe-logo.svg)

# TheNextWe - Koa MongoDB API

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

## Database Seeding

To populate the database with test data for all models:

```bash
npm run seed
```

This will create:

- 15 users across all roles (clients, coaches, PMs, ops)
- 5 projects with various manager assignments
- 7 coaching relationships linking clients, coaches, and projects

The seed script clears existing data before adding new test data.

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

3. Use `6893cdf475ffec5391f63af7` as the user id in the header to test the API or other user ids in the seed data file `src/seedData.ts`.

The Swagger UI provides detailed information about all available endpoints, request/response schemas, and allows you to test the API directly from the browser.
