import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    @Post()
    @HttpCode(200) 
    create(@Body() createMovieDto: CreateMovieDto) {
        return this.moviesService.create(createMovieDto);
    }

    @Get('all')
    @HttpCode(200)
    findAll() {
        return this.moviesService.findAll();
    }

    @Post('update/:movieTitle')
    @HttpCode(200)
    update(
        @Param('movieTitle') title: string,
        @Body() updateMovieDto: UpdateMovieDto
    ) {
        return this.moviesService.update(title, updateMovieDto);
    }

    @Delete(':movieTitle')
    @HttpCode(200)
    remove(@Param('movieTitle') title: string) {
        return this.moviesService.remove(title);
    }

}
