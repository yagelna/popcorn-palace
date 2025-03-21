import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository, Not } from "typeorm";
import { Showtime } from "./entities/showtime.entity";
import { CreateShowtimeDto } from "./dto/create-showtime.dto";
import { UpdateShowtimeDto } from "./dto/update-showtime.dto";
import { Movie } from "../movies/entities/movie.entity";
import { MoviesService } from "../movies/movies.service";

@Injectable()
export class ShowtimesService {
    constructor(
        @InjectRepository(Showtime)
        private readonly showtimeRepository: Repository<Showtime>,
        private readonly moviesService: MoviesService,
    ) {}

    async create(CreateShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
        await this.moviesService.findOneById(CreateShowtimeDto.movieId); // Check if movie exists
        const startTime = new Date(CreateShowtimeDto.startTime);
        const endTime = new Date(CreateShowtimeDto.endTime);

        if (startTime >= endTime) {
            throw new ConflictException('Start time must be before end time');
        }

        if (await this.checkOverlap(CreateShowtimeDto.theater, startTime, endTime)) {
            throw new ConflictException('Showtime overlaps with existing showtime');
        }

        const showtime = this.showtimeRepository.create({
            ...CreateShowtimeDto,
            startTime,
            endTime,
            movie: { id: CreateShowtimeDto.movieId } as Movie,
        }
        );
        return await this.showtimeRepository.save(showtime);
    }

    async update(showtimeId: number, updateShowtimeDto: UpdateShowtimeDto): Promise<void> {
        const showtime = await this.showtimeRepository.findOneBy({ id: showtimeId });
        if (!showtime) {
            throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
        }
        
        if (updateShowtimeDto.movieId) {
            await this.moviesService.findOneById(updateShowtimeDto.movieId);
        }

        const newStartTime = updateShowtimeDto.startTime ? new Date(updateShowtimeDto.startTime) : showtime.startTime;
        const newEndTime = updateShowtimeDto.endTime ? new Date(updateShowtimeDto.endTime) : showtime.endTime;
        const newTheater = updateShowtimeDto.theater ?? showtime.theater;

        if (updateShowtimeDto.startTime || updateShowtimeDto.endTime || updateShowtimeDto.theater) {
            if (newStartTime >= newEndTime) {
                throw new ConflictException('Start time must be before end time');
            }

            if (await this.checkOverlap(newTheater, newStartTime, newEndTime, showtimeId)) {
                throw new ConflictException('Showtime overlaps with existing showtime');
            }
        }

        // const newMovie = updateShowtimeDto.movieId ? { id: updateShowtimeDto.movieId } as Movie : showtime.movie;

        const { movieId, ...otherUpdates } = updateShowtimeDto;
    
        const newMovie = updateShowtimeDto.movieId ? { id: updateShowtimeDto.movieId } as Movie : showtime.movie;
    
    await this.showtimeRepository.update(showtimeId, {
        ...otherUpdates,
        startTime: newStartTime,
        endTime: newEndTime,
        theater: newTheater,
        movie: newMovie,
    });
        
    }

    async findOne(showtimeId: number): Promise<Showtime> {
        const showtime = await this.showtimeRepository.findOneBy({ id: showtimeId });
        if (!showtime) {
            throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
        }
        return showtime;
    }

    async remove(showtimeId: number): Promise<void> {
        const result = await this.showtimeRepository.delete({ id: showtimeId });
        if (result.affected === 0) {
            throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
        }
    }

    
    // Checks if a new showtime overlaps with any existing showtimes in the specified theater.
    private async checkOverlap(theater: string, newStartTime: Date, newEndTime: Date, showtimeId?: number): Promise<boolean> {
        const whereCondition = {
            theater,
            startTime: LessThanOrEqual(newEndTime),
            endTime: MoreThanOrEqual(newStartTime),
            ...(showtimeId && { id: Not(showtimeId) }),
        };

        return (await this.showtimeRepository.count({ where: whereCondition })) > 0;
    }

}
    