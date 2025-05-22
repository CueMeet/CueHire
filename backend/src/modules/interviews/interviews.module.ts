import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsResolver } from './interviews.resolver';
import { GoogleService } from '../../providers/google/google.service';
import { CueMeetService } from '../../providers/cuemeet/cuemeet.service';

@Module({
  providers: [
    InterviewsService,
    InterviewsResolver,
    GoogleService,
    CueMeetService,
  ],
  exports: [InterviewsService],
})
export class InterviewsModule {}
