import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import e from 'express';
import { DefaultDeserializer } from 'v8';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

describe('App - Movies & Showtimes & Bookings (E2E)', () => {

  let app: INestApplication;
  let dataSource: DataSource;

  const movies = [
    {
      title: 'Movie 1',
      genre: 'Action',
      duration: 120,
      rating: 8.5,
      releaseYear: 2025,
    },
    {
      title: 'Movie 2',
      genre: 'Comedy',
      duration: 90,
      rating: 7.5,
      releaseYear: 2025,
    },
  ];

  beforeAll(async () => {
  
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should respond with 404 for unknown route', async () => {
    await request(app.getHttpServer()).get('/unknown').expect(404);
  });

  // *******MOVIES TESTS********

  describe('Movies', () => {
    let createdMovieId: number;
    let createdMovieTitle: string;

    const updatedMovie = {
      title: 'Updated Movie',
      genre: 'Drama',
      duration: 150,
      rating: 9.2,
      releaseYear: 2024,
    };
  
    beforeAll(async () => {
      await dataSource.getRepository('movies').delete({});
    });
  
    it('create a new movie record', async () => {
      const res = await request(app.getHttpServer())
        .post('/movies')
        .send(movies[0])
        .expect(200);
  
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          ...movies[0],
        })
      );
  
      createdMovieTitle = res.body.title;
      expect(createdMovieTitle).toBe(movies[0].title);
    });
  
    it('should fail to create duplicate movie', async () => {
      const res = await request(app.getHttpServer())
        .post('/movies')
        .send(movies[0])
        .expect(409);
  
      expect(res.body.message).toMatch(/already exists/i);
    });
  
    it('should update the movie', async () => {
      const res = await request(app.getHttpServer())
        .post(`/movies/update/${createdMovieTitle}`)
        .send(updatedMovie)
        .expect(200);
    
      expect(res.body).toEqual({}); // empty response
    });

    it('should return all movies', async () => {
      await request(app.getHttpServer())
        .post('/movies')
        .send(movies[1])
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/movies/all')
        .expect(200);
  
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
    });
  
    it('should delete the updated movie', async () => {
      const delRes = await request(app.getHttpServer())
        .delete(`/movies/${updatedMovie.title}`)
        .expect(200);

      expect(delRes.body).toEqual({});

  
      const res = await request(app.getHttpServer())
        .get('/movies/all')
        .expect(200);
  
      const movieStillExists = res.body.find((m: any) => m.id === createdMovieId);
      expect(movieStillExists).toBeUndefined();
    });
  
    it('should fail to create movie with missing fields', async () => {
      const invalidMovie = {
        title: 'Incomplete Movie',
        duration: 100,
      };
  
      const res = await request(app.getHttpServer())
        .post('/movies')
        .send(invalidMovie)
        .expect(400);
  
      expect(res.body.message).toContain('genre should not be empty');
    });
  });


  // *******SHOWTIMES TESTS********

  describe('Showtimes', () => {
    let movieRecords: any[] = [];
    let showtimes: any[] = [];
    let overlappingShowtime: any;
    let showtimeId: number;

    

    beforeAll(async () => {
      await dataSource.getRepository('movies').delete({});
      await dataSource.getRepository('showtimes').delete({});
      movieRecords = await Promise.all(
        movies.map(movie => dataSource.getRepository('movies').save(movie))
      );

      showtimes = [
        {
          movieId: movieRecords[0].id,
          theater: 'Theater 1',
          price: 20.3,
          startTime: '2025-01-01T10:00:00.000Z',
          endTime: '2025-01-01T12:00:00.000Z',
        },
        {
          movieId: movieRecords[1].id,
          theater: 'Theater 2',
          price: 15.5,
          startTime: '2025-01-01T14:00:00.000Z',
          endTime: '2025-01-01T16:00:00.000Z',
        },
      ];

      overlappingShowtime = {
        movieId: movieRecords[0].id,
        theater: 'Theater 1',
        price: 18.5,
        startTime: '2025-01-01T11:00:00.000Z',
        endTime: '2025-01-01T13:00:00.000Z',
      };
    });

    it('should create a new showtime record', async () => {
      const res = await request(app.getHttpServer())
        .post('/showtimes')
        .send(showtimes[0])
        .expect(200);

      console.log(res.body);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          ...showtimes[0],
        })
      );
    });

    it('should fail to create overlapping showtime', async () => {
      const res = await request(app.getHttpServer())
        .post('/showtimes')
        .send(overlappingShowtime)
        .expect(409);

      expect(res.body.message).toBe('Showtime overlaps with existing showtime');
    });

    it('shold create another showtime record and get it by id', async () => {
      const res = await request(app.getHttpServer())
        .post('/showtimes')
        .send(showtimes[1])
        .expect(200);

      showtimeId = res.body.id;

      const getRes = await request(app.getHttpServer())
        .get(`/showtimes/${showtimeId}`)
        .expect(200);

      expect(getRes.body).toEqual(
        expect.objectContaining({
          id: showtimeId,
          ...showtimes[1],
        })
      );
    });

    it('should fail to get non-existent showtime', async () => {
      const res = await request(app.getHttpServer())
        .get('/showtimes/999')
        .expect(404);
      expect(res.body.message).toBe('Showtime with ID 999 not found');
    });

    it('should fail to create showtime with non-existent movie', async () => {
      const invalidShowtime = {
        movieId: 9999,
        theater: 'Theater 3',
        price: 25.5,
        startTime: '2025-01-01T18:00:00.000Z',
        endTime: '2025-01-01T20:00:00.000Z',
      };

      const res = await request(app.getHttpServer())
        .post('/showtimes')
        .send(invalidShowtime)
        .expect(404);

      expect(res.body.message).toBe('Movie with ID 9999 not found');
    });

    it('should update the showtime successfully', async () => {
      const updatedShowtime = {
        price: 50.5,
      };

      const res = await request(app.getHttpServer())
        .post(`/showtimes/update/${showtimeId}`)
        .send(updatedShowtime)
        .expect(200);

      expect(res.body).toEqual({}); // empty response

      const getRes = await request(app.getHttpServer())
        .get(`/showtimes/${showtimeId}`)
        .expect(200);

      expect(getRes.body.price).toBe(updatedShowtime.price);
    });

    it('fail to update showtime with overlapping time', async () => {
      const res = await request(app.getHttpServer())
        .post(`/showtimes/update/${showtimeId}`)
        .send(overlappingShowtime)
        .expect(409);

      expect(res.body.message).toBe('Showtime overlaps with existing showtime');
    });

    it('should delete the showtime', async () => {
      const delRes = await request(app.getHttpServer())
        .delete(`/showtimes/${showtimeId}`)
        .expect(200);

      expect(delRes.body).toEqual({});

      const getRes = await request(app.getHttpServer())
        .get(`/showtimes/${showtimeId}`)
        .expect(404);

      expect(getRes.body.message).toBe(`Showtime with ID ${showtimeId} not found`);
    });

  });

  // *******BOOKINGS TESTS********

  describe('Bookings', () => {
    let showtimeId: number;
    let bookingId: number;

    beforeAll(async () => {
      await dataSource.getRepository('bookings').delete({});
      await dataSource.getRepository('showtimes').delete({});
      await dataSource.getRepository('movies').delete({});

      const movieRecords = await Promise.all(
        movies.map(movie => dataSource.getRepository('movies').save(movie))
      );

      const showtimeRes = await request(app.getHttpServer())
        .post('/showtimes')
        .send({
          movieId: movieRecords[0].id,
          theater: 'Main Hall',
          price: 35.0,
          startTime: '2025-03-21T18:00:00.000Z',
          endTime: '2025-03-21T20:00:00.000Z',
        })
        .expect(200);

      showtimeId = showtimeRes.body.id;
    });

    it('should create a new booking record', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          showtimeId,
          seatNumber: 15 ,
          userId: "84438967-f68f-4fa0-b620-0f08217e76af"
        })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          bookingId: expect.any(String),
        })
      );
    });

    it('should fail to create booking with non-existent showtime', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          showtimeId: 999,
          seatNumber: 15,
          userId: "84438967-f68f-4fa0-b620-0f08217e76af"
        })
        .expect(404);

      expect(res.body.message).toBe('Showtime with ID 999 not found');
    });

    it('should fail to create booking to a booked seat', async () => {
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          showtimeId,
          seatNumber: 15,
          userId: "84438967-f68f-4fa0-b620-0f08217e76af"
        })
        .expect(409);

      expect(res.body.message).toBe('Seat is already booked for this showtime');
    });

  });
});
