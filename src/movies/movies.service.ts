import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "./entities/movie.entity";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
    ) {}

    async create(createMovieDto: CreateMovieDto): Promise<Movie> {
        const existing = await this.movieRepository.findOne({ where: { title: createMovieDto.title } });
        if (existing) {
            throw new ConflictException(`Movie with title '${createMovieDto.title}' already exists`);
        }
        const movie = this.movieRepository.create(createMovieDto);
        return this.movieRepository.save(movie);
    }

    async update(movieTitle: string, updateMovieDto: UpdateMovieDto): Promise<void> {
        const movie = await this.movieRepository.findOne({
            where: { title: movieTitle },
        });
        if (!movie) {
            throw new NotFoundException(`Movie with title ${movieTitle} not found`);
        }
        Object.assign(movie, updateMovieDto);
        await this.movieRepository.save(movie);
    }

    async findAll(): Promise<Movie[]> {
        return this.movieRepository.find();
    }

    async remove(movieTitle: string): Promise<void> {
        const result = await this.movieRepository.delete({ title: movieTitle });
        if (result.affected === 0) {
            throw new NotFoundException(`Movie with title ${movieTitle} not found`);
        }
    }
}
    