import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity( { name: 'movies' } )
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    title: string;
  
    @Column()
    genre: string;
  
    @Column()
    duration: number;
  
    @Column('float')
    rating: number;
  
    @Column({ name: 'release_year' })
    releaseYear: number;
  }