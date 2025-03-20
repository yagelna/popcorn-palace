import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "./entities/booking.entity";
import { ShowtimesService } from "src/showtimes/showtimes.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { Showtime } from "src/showtimes/entities/showtime.entity";

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        private readonly showtimesService: ShowtimesService,
    ) {}

    async create(createBookingDto: CreateBookingDto): Promise<Booking> {
        const showtime = await this.showtimesService.findOne(createBookingDto.showtimeId);
        const existing = await this.bookingRepository.findOne({
            where: {
                showtime: { id: createBookingDto.showtimeId },
                seatNumber: createBookingDto.seatNumber,
            }
        });

        if (existing) {
            throw new ConflictException('Seat is already booked for this showtime');
        }

        const booking = this.bookingRepository.create({
            ...createBookingDto,
            showtime: { id: createBookingDto.showtimeId } as Showtime,
        });

        return await this.bookingRepository.save(booking);
    }   
}
