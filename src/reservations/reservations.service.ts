import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { reservationsTable, booksTable, membersTable, loansTable } from '@/drizzle/schema';
import { eq, and, or } from 'drizzle-orm';
import { CreateReservationDto, UpdateReservationDto } from './dto/create-reservation.dto';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class ReservationsService {
  constructor(
    private drizzleService: DrizzleService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const db = this.drizzleService.getDb();

    // Verify member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, createReservationDto.member_id),
    });

    if (!member) {
      throw new NotFoundException(
        `Member with id ${createReservationDto.member_id} not found`,
      );
    }

    // Verify book exists
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, createReservationDto.book_id),
    });

    if (!book) {
      throw new NotFoundException(
        `Book with id ${createReservationDto.book_id} not found`,
      );
    }

    // Check if member already has an active reservation for this book
    const existingReservation = await db.query.reservationsTable.findFirst({
      where: and(
        eq(reservationsTable.member_id, createReservationDto.member_id),
        eq(reservationsTable.book_id, createReservationDto.book_id),
        eq(reservationsTable.status, 'WAITING'),
      ),
    });

    if (existingReservation) {
      throw new BadRequestException(
        'Member already has an active reservation for this book',
      );
    }

    // Get the queue position
    const reservations = await db.query.reservationsTable.findMany({
      where: and(
        eq(reservationsTable.book_id, createReservationDto.book_id),
        eq(reservationsTable.status, 'WAITING'),
      ),
    });

    const queuePosition = reservations.length + 1;

    const result = await db
      .insert(reservationsTable)
      .values({
        ...createReservationDto,
        status: 'WAITING',
        queue_position: queuePosition,
        created_at: new Date(),
      })
      .returning();

    return result[0];
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    memberId?: number,
    bookId?: number,
    status?: string,
  ) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    let whereClause;
    const conditions = [];

    if (memberId) conditions.push(eq(reservationsTable.member_id, memberId));
    if (bookId) conditions.push(eq(reservationsTable.book_id, bookId));
    if (status) conditions.push(eq(reservationsTable.status, status));

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const reservations = await db.query.reservationsTable.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (reservations) => [reservations.queue_position],
      with: {
        member: true,
        book: true,
      },
    });

    const total = await db.query.reservationsTable.findMany({
      where: whereClause,
    });

    return {
      data: reservations,
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
    const reservation = await db.query.reservationsTable.findFirst({
      where: eq(reservationsTable.id, id),
      with: {
        member: true,
        book: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    return reservation;
  }

  async getMemberReservations(
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

  async getBookReservations(
    bookId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const db = this.drizzleService.getDb();

    // Verify book exists
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, bookId),
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    return this.findAll(page, limit, undefined, bookId);
  }

  async cancel(id: number) {
    const db = this.drizzleService.getDb();
    const reservation = await this.findOne(id);

    if (reservation.status !== 'WAITING') {
      throw new BadRequestException(
        'Only WAITING reservations can be cancelled',
      );
    }

    // Update the reservation
    await db
      .update(reservationsTable)
      .set({
        status: 'CANCELLED',
        cancelled_at: new Date(),
      })
      .where(eq(reservationsTable.id, id));

    // Reorder queue positions for remaining reservations
    await this.reorderQueue(reservation.book_id);

    return { message: 'Reservation cancelled successfully' };
  }

  async checkAvailability(bookId: number) {
    const db = this.drizzleService.getDb();

    // Verify book exists
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, bookId),
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${bookId} not found`);
    }

    // Get active reservations
    const reservations = await db.query.reservationsTable.findMany({
      where: and(
        eq(reservationsTable.book_id, bookId),
        eq(reservationsTable.status, 'WAITING'),
      ),
    });

    return {
      bookId,
      title: book.title,
      availableCopies: book.available_quantity,
      isAvailable: book.available_quantity > 0,
      reservationQueue: reservations.length,
      firstInQueueId: reservations.length > 0 ? reservations[0].member_id : null,
    };
  }

  async notifyAvailability(bookId: number) {
    const db = this.drizzleService.getDb();

    // Get first member in queue
    const reservation = await db.query.reservationsTable.findFirst({
      where: and(
        eq(reservationsTable.book_id, bookId),
        eq(reservationsTable.status, 'WAITING'),
      ),
      orderBy: (reservations) => [reservations.queue_position],
    });

    if (!reservation) {
      return { message: 'No reservations for this book' };
    }

    // Verify book still has copies available
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, bookId),
    });

    if (!book || book.available_quantity <= 0) {
      return { message: 'Book is not available' };
    }

    // Update reservation status
    await db
      .update(reservationsTable)
      .set({
        status: 'READY',
        ready_at: new Date(),
      })
      .where(eq(reservationsTable.id, reservation.id));

    // Create notification
    await this.notificationsService.create({
      member_id: reservation.member_id,
      type: 'BOOK_AVAILABLE',
      title: 'Libro disponible',
      message: `El libro "${book.title}" está disponible para retirar. Por favor, recójalo antes de ${new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`,
      reference_type: 'RESERVATION',
      reference_id: reservation.id,
    });

    return {
      message: 'Member notified',
      reservationId: reservation.id,
      memberId: reservation.member_id,
    };
  }

  async confirm(id: number) {
    const db = this.drizzleService.getDb();
    const reservation = await this.findOne(id);

    if (reservation.status !== 'READY') {
      throw new BadRequestException(
        'Only READY reservations can be confirmed',
      );
    }

    // Verify book is still available
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, reservation.book_id),
    });

    if (!book || book.available_quantity <= 0) {
      throw new BadRequestException('Book is no longer available');
    }

    // Update reservation
    const result = await db
      .update(reservationsTable)
      .set({
        status: 'COMPLETED',
        completed_at: new Date(),
      })
      .where(eq(reservationsTable.id, id))
      .returning();

    // Reorder queue
    await this.reorderQueue(reservation.book_id);

    return result[0];
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(reservationsTable)
      .set(updateReservationDto)
      .where(eq(reservationsTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    const reservation = await this.findOne(id);

    await db.delete(reservationsTable).where(eq(reservationsTable.id, id));

    // Reorder queue
    await this.reorderQueue(reservation.book_id);

    return { message: `Reservation with id ${id} deleted successfully` };
  }

  private async reorderQueue(bookId: number) {
    const db = this.drizzleService.getDb();

    const reservations = await db.query.reservationsTable.findMany({
      where: and(
        eq(reservationsTable.book_id, bookId),
        eq(reservationsTable.status, 'WAITING'),
      ),
      orderBy: (reservations) => [reservations.created_at],
    });

    // Update queue positions
    for (let i = 0; i < reservations.length; i++) {
      await db
        .update(reservationsTable)
        .set({ queue_position: i + 1 })
        .where(eq(reservationsTable.id, reservations[i].id));
    }
  }
}
