import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsController', () => {
    let controller: BookingsController;
    let service: BookingsService;

    const mockBooking = {
        id: "d1a6423b-4469-4b00-8c5f-e3cfc42eacae",
        seatNumber: 1,
        showtime: { id: 1 },
        userId: "84438967-f68f-4fa0-b620-0f08217e76af",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BookingsController],
            providers: [
                {
                    provide: BookingsService,
                    useValue: {
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<BookingsController>(BookingsController);
        service = module.get<BookingsService>(BookingsService);
    });

    describe('bookTicket', () => {
        it('should return booking ID after successful creation', async () => {
            const dto: CreateBookingDto = {
                seatNumber: 1,
                showtimeId: 1,
                userId: "84438967-f68f-4fa0-b620-0f08217e76af",
            };

            jest.spyOn(service, 'create').mockResolvedValue(mockBooking as any);

            const result = await controller.bookTicket(dto);
            expect(result).toEqual({ bookingId: mockBooking.id });
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });
});