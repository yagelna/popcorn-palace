import { IsString, IsInt, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsInt()
  @IsNotEmpty()
  releaseYear: number;
}