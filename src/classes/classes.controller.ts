import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller()
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get('class')
  async getClass(
    @Query('manaboClassId') manaboClassId: string,
    @Query('term') term: string,
  ) {
    return this.classesService.getClass(manaboClassId, term);
  }

  @Post('class')
  async createClass(
    @Body()
    classDto: {
      manaboClassId: string;
      term: string;
      title: string;
      leadInstructor: string;
    },
  ) {
    return this.classesService.createClass(classDto);
  }

  @Post('classes/:classId/notifications')
  async subscribeToClassNotifications(@Param('classId') classId: string) {
    return this.classesService.subscribeToClassNotifications(classId);
  }

  @Delete('classes/:classId/notifications')
  async unsubscribeFromClassNotifications(@Param('classId') classId: string) {
    return this.classesService.unsubscribeFromClassNotifications(classId);
  }

  @Get('classes/notified')
  async getNotifiedClasses() {
    return this.classesService.getNotifiedClasses();
  }
}
