import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Movie } from "../../movies/entities/movie.entity";
import { Exclude } from "class-transformer";

@Entity( { name: 'showtimes' } )
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie' })
  @Exclude({ toPlainOnly: true })
  movie: Movie;
  
  @RelationId((showtime: Showtime) => showtime.movie)
  movieId: number;

  @Column()
  theater: string;

  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column('float')
  price: number;
}