import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { GoogleModule } from '../../providers/google/google.module';
import { AuthGuard } from '../../guards/auth.guard';
import { CueMeetModule } from '../../providers/cuemeet/cuemeet.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [GoogleModule, CueMeetModule, OrganizationModule],
  providers: [AuthResolver, AuthService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
