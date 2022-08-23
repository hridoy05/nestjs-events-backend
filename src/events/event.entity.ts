import { Expose } from 'class-transformer';
import { User } from 'src/auth/user.entity';
import { PaginationResult } from 'src/pagination/paginator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Attendee } from './attendee.entity';

@Entity('event')
export class Event {
  constructor(partial?: Partial<Event>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  name: string;
  @Column()
  @Expose()
  description: string;
  @Column()
  @Expose()
  when: Date;
  @Column()
  @Expose()
  address: string;

  @OneToMany(() => Attendee, (attendee) => attendee.event)
  @Expose()
  attendees: Attendee[];

  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizerId' })
  @Expose()
  organizer: User;
  @Column({ nullable: true })
  organizerId: number;
  @Expose()
  attendeeCount?: number;
  @Expose()
  attendeeRejected?: number;
  @Expose()
  attendeeMaybe?: number;
  @Expose()
  attendeeAccepted: number;
}

export type paginatedEvent = PaginationResult<Event>;
