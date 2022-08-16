import { AuthGuardJwt } from './../auth/auth-guard.jwt';
import { Event } from './event.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('/events')
export class EventController {
  private readonly logger = new Logger(EventController.name);
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendenceRepository: Repository<Attendee>,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  async findAll() {
    this.logger.log(`Hit the findAll route`);
    const events = await this.repository.find({
      relations: {
        attendees: true,
      },
    });
    this.logger.debug(`Found ${events.length} events`);
    return events;
  }

  // @Get('practice2')
  // async practice2() {
  //   return await this.repository.findOne({
  //     where: {
  //       id: 1,
  //     },
  //     relations: ['attendees'],
  //   });
  // }

  // @Get('/practice')
  // async find() {
  //   return await this.repository.find({
  //     where: {
  //       id: 3,
  //     },
  //   });
  // }

  @Get(':id')
  async findOne(@Param('id') id) {
    // return await this.repository.findOneBy({ id });
    const event = this.eventsService.getEvent(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id);

    return this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const event = await this.repository.findOne(id);
    await this.repository.remove(event);
  }
}
