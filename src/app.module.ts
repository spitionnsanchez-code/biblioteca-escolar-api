import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { AuthModule } from '@/auth/auth.module';
import { MembersModule } from '@/members/members.module';
import { BooksModule } from '@/books/books.module';
import { CategoriesModule } from '@/categories/categories.module';
import { LoansModule } from '@/loans/loans.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { ReportsModule } from '@/reports/reports.module';
import { ReservationsModule } from '@/reservations/reservations.module';
import { FinesModule } from '@/fines/fines.module';
import { RolesModule } from '@/roles/roles.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule,
    AuthModule,
    MembersModule,
    BooksModule,
    CategoriesModule,
    LoansModule,
    NotificationsModule,
    ReportsModule,
    ReservationsModule,
    FinesModule,
    RolesModule,
    UsersModule,
  ],
})
export class AppModule {}
