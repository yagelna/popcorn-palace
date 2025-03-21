import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ShowtimesService } from '../showtimes/showtimes.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('BookingsService', () => {
    let service: BookingsService;
    let repository: Repository<Booking>;
    let showtimesService: ShowtimesService;

    const mockShowtime = { id: 1 };
    const mockBooking = {
        id: "d1a6423b-4469-4b00-8c5f-e3cfc42eacae",
        seatNumber: 1,
        showtime: { id: 1 },
        userId: "84438967-f68f-4fa0-b620-0f08217e76af",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                {
                    provide: getRepositoryToken(Booking),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: ShowtimesService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
        repository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
        showtimesService = module.get<ShowtimesService>(ShowtimesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a new booking', async () => {
            const dto: CreateBookingDto = {
                seatNumber: 1,
                showtimeId: 1,
                userId: "84438967-f68f-4fa0-b620-0f08217e76af",
            };

            jest.spyOn(showtimesService, 'findOne').mockResolvedValue(mockShowtime as any);
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockReturnValue(mockBooking as Booking);
            jest.spyOn(repository, 'save').mockResolvedValue(mockBooking as Booking);

            const result = await service.create(dto);

            expect(result).toEqual(mockBooking);
            expect(repository.create).toHaveBeenCalledWith({
                ...dto,
                showtime: { id: dto.showtimeId },
            });
            expect(repository.save).toHaveBeenCalledWith(mockBooking);
        });

        it('should throw ConflictException if seat is already booked', async () => {
            const dto: CreateBookingDto = {
                seatNumber: 1,
                showtimeId: 1,
                userId: "84438967-f68f-4fa0-b620-0f08217e76af",
            };

            jest.spyOn(showtimesService, 'findOne').mockResolvedValue(mockShowtime as any);
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockBooking as Booking);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });

        it('should throw NotFoundException if showtime does not exist', async () => {
            const dto: CreateBookingDto = {
                seatNumber: 1,
                showtimeId: 999,
                userId: "84438967-f68f-4fa0-b620-0f08217e76af",
            };

            jest.spyOn(showtimesService, 'findOne').mockRejectedValue(new NotFoundException());

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
        });
    });
});
