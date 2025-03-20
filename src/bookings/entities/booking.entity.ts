import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Showtime } from "src/showtimes/entities/showtime.entity";

@Entity( { name: 'bookings' } )
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Showtime, { onDelete: 'CASCADE' })
  @JoinColumn( { name: 'showtime_id' } )
  showtime: Showtime; 

  @Column( {name: 'seat_number'} )
  seatNumber: number;

  @Column( {name: 'user_id'} )
  userId: string;
}