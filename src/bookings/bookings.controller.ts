import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(200)
  async bookTicket(@Body() createBookingDto: CreateBookingDto) {
    const booking = await this.bookingsService.create(createBookingDto);

    return { bookingId: booking.id };
  }
}