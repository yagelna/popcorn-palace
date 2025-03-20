import { IsString, IsNumber, IsDateString, IsInt } from 'class-validator';

export class CreateShowtimeDto {
  @IsInt()
  movieId: number;

  @IsString()
  theater: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsNumber()
  price: number;
}