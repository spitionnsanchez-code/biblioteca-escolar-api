import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { notificationsTable, loansTable, membersTable } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const db = this.drizzleService.getDb();

    // Verify member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, createNotificationDto.member_id),
    });

    if (!member) {
      throw new NotFoundException(
        `Member with id ${createNotificationDto.member_id} not found`,
      );
    }

    const result = await db
      .insert(notificationsTable)
      .values({
        ...createNotificationDto,
        created_at: new Date(),
        is_read: false,
      })
      .returning();

    return result[0];
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    memberId?: number,
    isRead?: boolean,
  ) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    let whereClause;
    if (memberId && isRead !== undefined) {
      whereClause = and(
        eq(notificationsTable.member_id, memberId),
        eq(notificationsTable.is_read, isRead),
      );
    } else if (memberId) {
      whereClause = eq(notificationsTable.member_id, memberId);
    } else if (isRead !== undefined) {
      whereClause = eq(notificationsTable.is_read, isRead);
    }

    const notifications = await db.query.notificationsTable.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (notifications) => [{
        desc: notifications.created_at,
      }],
    });

    const total = await db.query.notificationsTable.findMany({
      where: whereClause,
    });

    return {
      data: notifications,
      pagination: {
        total: total.length,
        page,
        limit,
        pages: Math.ceil(total.length / limit),
      },
    };
  }

  async findOne(id: number) {
    const db = this.drizzleService.getDb();
    const notification = await db.query.notificationsTable.findFirst({
      where: eq(notificationsTable.id, id),
    });

    if (!notification) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }

    return notification;
  }

  async getMemberNotifications(
    memberId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const db = this.drizzleService.getDb();

    // Verify member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, memberId),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${memberId} not found`);
    }

    return this.findAll(page, limit, memberId);
  }

  async markAsRead(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(notificationsTable)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(eq(notificationsTable.id, id))
      .returning();

    return result[0];
  }

  async markAllAsRead(memberId: number) {
    const db = this.drizzleService.getDb();

    // Verify member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, memberId),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${memberId} not found`);
    }

    const result = await db
      .update(notificationsTable)
      .set({
        is_read: true,
        read_at: new Date(),
      })
      .where(eq(notificationsTable.member_id, memberId))
      .returning();

    return {
      message: `${result.length} notification(s) marked as read`,
      count: result.length,
    };
  }

  async getUnreadCount(memberId: number) {
    const db = this.drizzleService.getDb();

    // Verify member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, memberId),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${memberId} not found`);
    }

    const unreadNotifications = await db.query.notificationsTable.findMany({
      where: and(
        eq(notificationsTable.member_id, memberId),
        eq(notificationsTable.is_read, false),
      ),
    });

    return {
      memberId,
      unreadCount: unreadNotifications.length,
    };
  }

  async createLoanReminder(loanId: number) {
    const db = this.drizzleService.getDb();

    // Find the loan
    const loan = await db.query.loansTable.findFirst({
      where: eq(loansTable.id, loanId),
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    // Create reminder notification
    const daysUntilDue = Math.ceil(
      (loan.due_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.create({
      member_id: loan.member_id,
      type: 'LOAN_REMINDER',
      title: 'Recordatorio de devolución de libro',
      message: `Su préstamo vence en ${daysUntilDue} días. Por favor, devuelva el libro antes de la fecha límite.`,
      reference_type: 'LOAN',
      reference_id: loanId,
    });
  }

  async createOverdueNotification(loanId: number) {
    const db = this.drizzleService.getDb();

    // Find the loan
    const loan = await db.query.loansTable.findFirst({
      where: eq(loansTable.id, loanId),
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    const daysPassed = Math.floor(
      (new Date().getTime() - loan.due_date.getTime()) / (1000 * 60 * 60 * 24),
    );

    return this.create({
      member_id: loan.member_id,
      type: 'LOAN_OVERDUE',
      title: 'Libro con retraso en devolución',
      message: `Su préstamo está ${daysPassed} día(s) vencido. Por favor, devuelva el libro inmediatamente.`,
      reference_type: 'LOAN',
      reference_id: loanId,
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(notificationsTable)
      .set(updateNotificationDto)
      .where(eq(notificationsTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    await db.delete(notificationsTable).where(eq(notificationsTable.id, id));

    return { message: `Notification with id ${id} deleted successfully` };
  }
}
