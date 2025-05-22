import { Module } from '@nestjs/common';
import { CalendarEventsScheduler } from './index';
import { CueMeetModule } from '../providers/cuemeet/cuemeet.module';
import { BullModule } from '@nestjs/bull';
import { TRANSCRIPT_PROCESSING_QUEUE } from '../constants/bull-queue';

@Module({
  imports: [
    CueMeetModule,
    BullModule.registerQueue({
      name: TRANSCRIPT_PROCESSING_QUEUE,
    }),
  ],
  providers: [CalendarEventsScheduler],
})
export class SchedulerModule {}
