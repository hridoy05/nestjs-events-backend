import { AuthGuardJwt } from './../auth/auth-guard.jwt';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { EventsService } from './events.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/user.entity';
import { ListEvents } from './input/list.events';

@Controller('/events')
export class EventController {
  private readonly logger = new Logger(EventController.name);
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
    this.logger.log(`Hit the findAll route`);
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2,
        },
      );
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
  @UseGuards(AuthGuardJwt)
  async update(
    @Param('id') id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User,
  ) {
    const event = await this.eventsService.getEvent(id);

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        `You are not authoririzes to  change this event`,
      );
    }

    return this.eventsService.updateEvent(event, input);
  }
  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id') id, @CurrentUser() user: User) {
    const event = await this.eventsService.getEvent(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null,
        `You are not authoririzes to remove this event`,
      );
    }
    await this.eventsService.deleteEvent(id);
  }
}
