import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TranscriptProcessor } from './transcript.processor';
import { CueMeetService } from '../providers/cuemeet/cuemeet.service';
import { TRANSCRIPT_PROCESSING_QUEUE } from '../constants/bull-queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSCRIPT_PROCESSING_QUEUE,
    }),
  ],
  providers: [TranscriptProcessor, CueMeetService],
})
export class TranscriptModule {}
