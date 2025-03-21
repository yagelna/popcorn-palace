import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  describe('create', () => {
    it('should create a movie', async () => {
      const createDto: CreateMovieDto = {
        title: 'Movie Title',
        genre: 'Action',
        duration: 120,
        rating: 8.5,
        releaseYear: 2025,
      };
      const createdMovie = { id: 1, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(createdMovie);

      const result = await controller.create(createDto);
      expect(result).toEqual(createdMovie);
    });
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const movies = [
        { id: 1, title: 'Movie 1', genre: 'Action', duration: 120, rating: 8.5, releaseYear: 2025 },
        { id: 2, title: 'Movie 2', genre: 'Comedy', duration: 90, rating: 7.5, releaseYear: 2023 },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(movies);

      const result = await controller.findAll();
      expect(result).toEqual(movies);
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const updateDto: UpdateMovieDto = { genre: 'Drama' };
      jest.spyOn(service, 'update').mockResolvedValue();

      await expect(controller.update('Movie Title', updateDto)).resolves.not.toThrow();
      expect(service.update).toHaveBeenCalledWith('Movie Title', updateDto);
    });

    it('should throw NotFoundException when updating a non-existent movie', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());

      await expect(controller.update('Nonexistent Movie', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a movie', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await expect(controller.remove('Movie Title')).resolves.not.toThrow();
      expect(service.remove).toHaveBeenCalledWith('Movie Title');
    });

    it('should throw NotFoundException when deleting a non-existent movie', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('Nonexistent Movie')).rejects.toThrow(NotFoundException);
    });
  });
});
