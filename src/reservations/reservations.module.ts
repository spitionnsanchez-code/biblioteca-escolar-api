import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [DrizzleModule, NotificationsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
