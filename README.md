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

3. Use one of the available user IDs in the header to test the API. You can get the current user IDs by running `npm run list-users`, or use one of these examples:
   - **Client**: `689a6e38fedb24124ad79c09` (Bambi Deer)
   - **Coach**: `689a6e38fedb24124ad79c0f` (Sherlock Holmes)
   - **Project Manager**: `689a6e38fedb24124ad79c13` (Tony Stark)
   - **Operations**: `689a6e38fedb24124ad79c16` (Gandalf the Grey)

## Further Improvements Plan

- add `koa-bodyparser` and `koa-cors` in case of frontend integration and new endpoints
- add custom logger
- implement caching layer (e.g. Redis) to improve performance for frequently accessed data
- add request validation middleware using a schema validator like `Joi` or `Yup`
