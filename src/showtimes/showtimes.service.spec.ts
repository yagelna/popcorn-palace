import { Repository } from "typeorm";
import { ShowtimesService } from "./showtimes.service";
import { Showtime } from "./entities/showtime.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { Movie } from "../movies/entities/movie.entity";
import { MoviesService } from "../movies/movies.service";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe('ShowtimesService', () => {
    let service: ShowtimesService;
    let repository: Repository<Showtime>;
    let mockShowtime: Showtime;
    let moviesService: MoviesService;
    let mockMovie: Movie;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShowtimesService,
                {
                    provide: getRepositoryToken(Showtime),
                    useValue: {
                        findOneBy: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        find: jest.fn(),
                        count: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: MoviesService,
                    useValue: {
                        findOneById: jest.fn(),
                    },
                }
            ],
        }).compile();

        service = module.get<ShowtimesService>(ShowtimesService);
        repository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
        moviesService = module.get<MoviesService>(MoviesService);

        mockMovie = {
            id: 1,
            title: "Test Movie",
            genre: "Action",
            duration: 120,
            rating: 8.5,
            releaseYear: 2025,
        };

        mockShowtime = {
            id: 1,
            theater: 'Test Theater',
            startTime: new Date("2025-01-01T10:00:00Z"),
            endTime: new Date("2025-01-01T12:00:00Z"),
            price: 10,
            movie: mockMovie,
            movieId: mockMovie.id,
        } as Showtime;
    }); 

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new showtime record', async () => {
            const createDto = {
                movieId: mockMovie.id,
                theater: mockShowtime.theater,
                startTime: mockShowtime.startTime,
                endTime: mockShowtime.endTime,
                price: 10,
            };

            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);
            jest.spyOn(repository, 'create').mockReturnValueOnce(mockShowtime);
            jest.spyOn(repository, 'save').mockResolvedValueOnce(mockShowtime);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith({
                ...createDto,
                startTime: mockShowtime.startTime,
                endTime: mockShowtime.endTime,
                movie: { id: createDto.movieId } as Movie,
            });

            expect(repository.save).toHaveBeenCalledWith(mockShowtime);
            expect(result).toEqual(mockShowtime);
        });

        it('should throw NotFoundException if movie does not exist', async () => {
            jest.spyOn(moviesService, 'findOneById').mockRejectedValueOnce(new NotFoundException());

            await expect(service.create({
                movieId: 999,
                theater: mockShowtime.theater,
                startTime: mockShowtime.startTime,
                endTime: mockShowtime.endTime,
                price: 10,
            })).rejects.toThrow(NotFoundException);
        });

        it('should throw an error if start time is after end time', async () => {
            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);
        
            await expect(service.create({
                movieId: mockMovie.id,
                theater: mockShowtime.theater,
                startTime: new Date("2025-01-01T12:00:00Z"),
                endTime: new Date("2025-01-01T10:00:00Z"),
                price: 10,
            })).rejects.toThrow('Start time must be before end time');
        });

        it('should throw ConflictException if showtime overlaps', async () => {
            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);
            jest.spyOn(repository, 'count').mockResolvedValueOnce(1);

            await expect(service.create({
                movieId: mockMovie.id,
                theater: mockShowtime.theater,
                startTime: new Date("2025-01-01T09:00:00Z"),
                endTime: new Date("2025-01-01T11:00:00Z"),
                price: 10,
            })).rejects.toThrow('Showtime overlaps with existing showtime');
        });
    });

    describe('update', () => {  
        it('should update an existing showtime record', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockShowtime);
            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);
            jest.spyOn(repository, 'count').mockResolvedValueOnce(0);
            jest.spyOn(repository, 'update').mockResolvedValueOnce(undefined);
        
            const updateDto = {
                theater: 'New Theater',
                startTime: new Date("2025-01-01T11:00:00Z"),
                endTime: new Date("2025-01-01T13:00:00Z"),
                price: 15,
                movieId: mockMovie.id,
            };

            await expect(service.update(mockShowtime.id, updateDto)).resolves.not.toThrow();
  
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockShowtime.id });
            expect(repository.update).toHaveBeenCalledWith(mockShowtime.id, {
                startTime: updateDto.startTime,
                endTime: updateDto.endTime,
                theater: updateDto.theater,
                price: updateDto.price,
                movie: { id: updateDto.movieId } as Movie,
            });
        });

        it('should throw NotFoundException if showtime does not exist', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(undefined);

            await expect(service.update(1, { price: 22 }))
                .rejects.toThrow('Showtime with ID 1 not found');
        });

        it('should throw NotFoundException if you try to update a showtime with a non-existing movie', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockShowtime);
            jest.spyOn(moviesService, 'findOneById').mockRejectedValueOnce(new NotFoundException());

            await expect(service.update(mockShowtime.id, { movieId: 999 }))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw an error if start time is after end time', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockShowtime);
            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);

            await expect(service.update(mockShowtime.id, {
                startTime: new Date("2025-01-01T12:00:00Z"),
                endTime: new Date("2025-01-01T10:00:00Z"),
            })).rejects.toThrow('Start time must be before end time');
        });

        it('should throw ConflictException if showtime overlaps', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockShowtime);
            jest.spyOn(moviesService, 'findOneById').mockResolvedValueOnce(mockMovie);
            jest.spyOn(repository, 'count').mockResolvedValueOnce(1);

            await expect(service.update(mockShowtime.id, {
                startTime: new Date("2025-01-01T09:00:00Z"),
                endTime: new Date("2025-01-01T11:00:00Z"),
            })).rejects.toThrow('Showtime overlaps with existing showtime');

        });
    });
    describe('findOne', () => {
        it('should return a showtime if found', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockShowtime);

            const result = await service.findOne(mockShowtime.id);
            expect(result).toEqual(mockShowtime);
        });

        it('should throw NotFoundException if showtime not found', async () => {
            jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

            await expect(service.findOne(999)).rejects.toThrow('Showtime with ID 999 not found');
        });
    });

    describe('remove', () => {
        it('should delete a showtime successfully', async () => {
            jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 1 } as any);

            await service.remove(mockShowtime.id);
            expect(repository.delete).toHaveBeenCalledWith({ id: mockShowtime.id });
        });

        it('should throw NotFoundException if showtime not found', async () => {
            jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0 } as any);

            await expect(service.remove(999)).rejects.toThrow('Showtime with ID 999 not found');
        });
    });

});
