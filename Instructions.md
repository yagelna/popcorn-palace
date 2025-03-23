
#  Popcorn Palace - Movie Ticket Booking System - Backend Development

A RESTful API for managing movies, showtimes, and bookings using NestJS, TypeORM, and PostgreSQL as part of TDP Assignment.


## Requirements

- **Node.js** ≥ 18.16.0  
- **npm** ≥ 9.5.1  
- **Docker** ≥ 26.1.4

> The project was tested with the following versions:
> - Node.js: 18.16.0, 20.17.0  
> - npm: 9.5.1, 10.8.3  
> - Docker: 26.1.4, 27.0.3
>
> **NOTE:** It may work on Node.js 15.6.0+ npm 8.x+, and previous versions of Docker, but has not been verified.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yagelna/popcorn-palace.git
# navigate to the project folder
cd popcorn-palace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the PostgreSQL database

```bash
docker compose up -d

# or if not supported you can use:
docker-compose up -d
```

Make sure the `compose.yml` file exists in the project root.
It defines two PostgreSQL services - one for the main application and another for testing purposes.

If the ports defined in the file are already in use on your system, you can change them inside `compose.yml`, but make sure to update the .env and .env.test files accordingly.


### 4. Environment Variables Configuration
Two .env files are used in this project:

- `.env` for running the application locally.
- `.env.test` for running end-to-end tests.

These files were excluded from `.gitignore` on purpose, since they don’t contain any sensitive data, but it's still important to review and adjust the values if needed, especially if you change the database configuration in the `compose.yml` file.

```bash
# .env
DB_HOST=localhost
DB_PORT=5433
DB_USER=popcorn-palace
DB_PASS=popcorn-palace
DB_NAME=popcorn-palace

# .env.test
DB_HOST=localhost
DB_PORT=5434
DB_USER=popcorn-palace
DB_PASS=popcorn-palace
DB_NAME=popcorn-palace-test
``` 

## Running the Project

To start the application locally and run tests, use the following scripts.  
Make sure the PostgreSQL database is running in the background.



| Script                 | Description                        |
|------------------------|------------------------------------|
| `npm run start`        | Start the application (watch mode)            |
| `npm run start:dev`    | Start the application (development mode)  |
| `npm run start:prod`   | Start the application (production mode) |
| `npm run test`         | Run unit tests         |
| `npm run test:e2e`     | Run e2e(end-to-end) tests          |
| `npm run test:cov`     | Run unit tests and view coverage report |

> The server runs on [http://localhost:3000](http://localhost:3000) by default.

## Notes

- Make sure the PostgreSQL database is running before you start the application.
- You can connect to the DB using tools like **pgAdmin** or any other PostgreSQL client.

## API Endpoints Overview

### Movies
| Method | Endpoint           | Description                   |
|--------|--------------------|-------------------------------|
| GET    | `/movies/all`      | Get all movies                |
| POST   | `/movies`          | Create a new movie            |
| POST   | `/movies/update/:title` | Update a movie by title  |
| DELETE | `/movies/:title`   | Delete a movie by title       |

### Showtimes
| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| POST   | `/showtimes`           | Create a new showtime           |
| GET    | `/showtimes/:id`       | Get a showtime by ID            |
| POST   | `/showtimes/update/:id`| Update a showtime by ID         |
| DELETE | `/showtimes/:id`       | Delete a showtime by ID         |

### Bookings
| Method | Endpoint        | Description             |
|--------|-----------------|-------------------------|
| POST   | `/bookings`     | Create a new booking    |  

----

> **NOTE:** This implementation follows the instructions provided in the assignment document and the examples included in the `README.md` file in this repository.
For more details, such as request/response bodies and response status codes, please refer to the `README.md`.

## Example - Create a new movie

### Request

```http
POST /movies
Content-Type: application/json

{
    "title": "Yagel's Movie",
    "genre": "Documentary",
    "duration": 120,
    "rating": 10,
    "releaseYear": 1996
}
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
    "id": 1,
    "title": "Yagel's Movie",
    "genre": "Documentary",
    "duration": 120,
    "rating": 10,
    "releaseYear": 1996
}
```