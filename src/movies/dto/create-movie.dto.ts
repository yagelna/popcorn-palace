import { IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  genre: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsNumber()
  rating: number;

  @IsInt()
  releaseYear: number;
}