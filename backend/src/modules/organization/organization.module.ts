import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationResolver } from './organization.resolver';
import { CueMeetModule } from '../../providers/cuemeet/cuemeet.module';

@Module({
  imports: [CueMeetModule],
  providers: [OrganizationService, OrganizationResolver],
  exports: [OrganizationService],
})
export class OrganizationModule {}
