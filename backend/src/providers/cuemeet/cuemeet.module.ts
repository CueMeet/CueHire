import { Module } from '@nestjs/common';
import { CueMeetService } from './cuemeet.service';

@Module({
  providers: [CueMeetService],
  exports: [CueMeetService],
})
export class CueMeetModule {}
