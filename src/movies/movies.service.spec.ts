import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;
  let mockMovie: Movie;
  let anotherMockMovie: Movie;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));

    mockMovie = {
      id: 1,
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      rating: 8.5,
      releaseYear: 2025,
    } as Movie;

    anotherMockMovie = { // for testing findAll
      id: 2,
      title: 'Another Movie',
      genre: 'Comedy',
      duration: 90,
      rating: 7.5,
      releaseYear: 2025,
    } as Movie;

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new movie record', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(mockMovie);

      const result = await service.create({
        title: mockMovie.title,
        genre: mockMovie.genre,
        duration: mockMovie.duration,
        rating: mockMovie.rating,
        releaseYear: mockMovie.releaseYear,
      });

      expect(result).toEqual(mockMovie);
    });

    it('should throw ConflictException if movie already exists', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockMovie);
      await expect(service.create(mockMovie)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockMovie, anotherMockMovie]);
      const result = await service.findAll();
      expect(result).toEqual([mockMovie, anotherMockMovie]);
    });

    it('should return an empty array if no movies exist', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOneById', () => {
    it('should return a movie by id', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockMovie);
      const result = await service.findOneById(1);
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie id does not exist', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByTitle', () => {
    it('should return a movie by title', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockMovie);
      const result = await service.findOneByTitle(mockMovie.title);
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie title does not exist', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOneByTitle('Nonexistent Movie')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing movie successfully', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(mockMovie);
      const updatedMovie = { ...mockMovie, genre: 'Drama' };
      jest.spyOn(repository, 'save').mockResolvedValue(updatedMovie);

      await service.update(mockMovie.title, { genre: 'Drama' });
      expect(repository.save).toHaveBeenCalledWith(updatedMovie);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(null);
      await expect(service.update('Nonexistent Movie', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating to an existing title', async () => {
      jest.spyOn(service, 'findOneByTitle').mockResolvedValue(mockMovie);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockMovie);
      await expect(service.update(mockMovie.title, { title: 'Existing Movie' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a movie successfully', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);
      await service.remove(mockMovie.title);
      expect(repository.delete).toHaveBeenCalledWith({ title: mockMovie.title });
    });

    it('should throw NotFoundException if trying to delete a non-existent movie', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('Nonexistent Movie')).rejects.toThrow(NotFoundException);
    });
  });
});
