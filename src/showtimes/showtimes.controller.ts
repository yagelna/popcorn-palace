import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Controller('showtimes')
export class ShowtimesController {
    constructor(private readonly showtimesService: ShowtimesService) {}

    @Post()
    @HttpCode(200) 
    create(@Body() createShowtimeDto: CreateShowtimeDto) {
        return this.showtimesService.create(createShowtimeDto);
    }

    @Get(':showtimeId')
    @HttpCode(200)
    findOne(@Param('showtimeId') showtimeId: string) {
        return this.showtimesService.findOne(Number(showtimeId));
    }

    @Post('update/:showtimeId')
    @HttpCode(200)
    update(
        @Param('showtimeId') showtimeId: string,
        @Body() updateShowtimeDto: UpdateShowtimeDto
    ) {
        return this.showtimesService.update(Number(showtimeId), updateShowtimeDto);
    }

    @Delete(':showtimeId')
    @HttpCode(200)
    remove(@Param('showtimeId') showtimeId: string) {
        return this.showtimesService.remove(Number(showtimeId));
    }
}