import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;
  let mockMovie: any;

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

    mockMovie = {
      id: 1,
      title: 'Movie Title',
      genre: 'Action',
      duration: 120,
      rating: 8.5,
      releaseYear: 2025,
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockMovie);
      const result = await controller.create(mockMovie);
      expect(result).toEqual(mockMovie);
    });

    it('should throw ConflictException if movie already exists', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new ConflictException());
      await expect(controller.create(mockMovie)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockMovie]);
      const result = await controller.findAll();
      expect(result).toEqual([mockMovie]);
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      jest.spyOn(service, 'update').mockResolvedValue();
      await expect(controller.update(mockMovie.title, { genre: 'Drama' })).resolves.not.toThrow();
      expect(service.update).toHaveBeenCalledWith(mockMovie.title, { genre: 'Drama' });
    });

    it('should throw NotFoundException when updating a non-existent movie', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());
      await expect(controller.update('Nonexistent Movie', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a movie', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();
      await expect(controller.remove(mockMovie.title)).resolves.not.toThrow();
      expect(service.remove).toHaveBeenCalledWith(mockMovie.title);
    });

    it('should throw NotFoundException when deleting a non-existent movie', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());
      await expect(controller.remove('Nonexistent Movie')).rejects.toThrow(NotFoundException);
    });
  });
});