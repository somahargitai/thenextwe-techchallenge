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

## Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
