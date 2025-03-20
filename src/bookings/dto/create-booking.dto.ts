import { IsString, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  showtimeId: number;

  @IsNumber()
  seatNumber: number;

  @IsString()
  userId: string;
}