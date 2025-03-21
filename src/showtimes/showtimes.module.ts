import { Module } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { ShowtimesController } from './showtimes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Showtime]),
    MoviesModule
  ],
  controllers: [ShowtimesController],
  providers: [ShowtimesService],
  exports: [ShowtimesService]
})
export class ShowtimesModule {}