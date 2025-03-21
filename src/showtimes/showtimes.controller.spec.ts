import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { NotFoundException } from '@nestjs/common';

describe('ShowtimesController', () => {
    let controller: ShowtimesController;
    let service: ShowtimesService;

    const mockShowtime = {
        id: 1,
        theater: 'Test Theater',
        startTime: new Date("2025-01-01T10:00:00Z"),
        endTime: new Date("2025-01-01T12:00:00Z"),
        price: 10,
        movieId: 1,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShowtimesController],
            providers: [
                {
                    provide: ShowtimesService,
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ShowtimesController>(ShowtimesController);
        service = module.get<ShowtimesService>(ShowtimesService);
    });

    describe('create', () => {
        it('should call service.create and return the result', async () => {
            const createDto: CreateShowtimeDto = { ...mockShowtime };
            jest.spyOn(service, 'create').mockResolvedValue(mockShowtime as any);

            const result = await controller.create(createDto);
            expect(result).toEqual(mockShowtime);
            expect(service.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findOne', () => {
        it('should return a showtime if found', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockShowtime as any);

            const result = await controller.findOne('1');
            expect(result).toEqual(mockShowtime);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if showtime not found', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

            await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should call service.update and return void', async () => {
            const updateDto: UpdateShowtimeDto = { theater: 'Updated Theater' };
            jest.spyOn(service, 'update').mockResolvedValue(undefined);

            await expect(controller.update('1', updateDto)).resolves.toBeUndefined();
            expect(service.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('remove', () => {
        it('should call service.remove and return void', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(undefined);

            await expect(controller.remove('1')).resolves.toBeUndefined();
            expect(service.remove).toHaveBeenCalledWith(1);
        });
    });
});
