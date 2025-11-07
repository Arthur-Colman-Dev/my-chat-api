import { PrismaService } from '@common/db/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message, Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({ where: { id } });
  }

  async create(data: {
    authorId: string;
    content: string;
    idempotencyKey?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Message> {
    // Idempotency: return existing if key already used
    const existing = await this.validateIndempotencyKey(data.idempotencyKey);
    if (existing) return existing;

    // Two-step because threadId = id of the created root
    const created = await this.prisma.message.create({
      data: {
        authorId: data.authorId,
        content: data.content,
        metadata: data.metadata,
        depth: 0,
        threadId: '', // temp
        idempotencyKey: data.idempotencyKey,
      },
    });

    return this.prisma.message.update({
      where: { id: created.id },
      data: { threadId: created.id },
    });
  }

  async reply(data: {
    authorId: string;
    parentId: string;
    content: string;
    idempotencyKey?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Message> {
    // Idempotency: return existing if key already used
    const existing = await this.validateIndempotencyKey(data.idempotencyKey);
    if (existing) return existing;

    const parent = await this.prisma.message.findUnique({
      where: { id: data.parentId },
    });
    if (!parent || parent.deletedAt) {
      throw new NotFoundException('Parent message not found');
    }

    return this.prisma.message.create({
      data: {
        authorId: data.authorId,
        content: data.content,
        parentId: parent.id,
        threadId: parent.threadId,
        depth: parent.depth + 1,
        metadata: data.metadata,
        idempotencyKey: data.idempotencyKey,
      },
    });
  }

  async edit(data: {
    id: string;
    authorId: string;
    content: string;
  }): Promise<Message> {
    // Use a transaction to validate ownership + version, then update
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.message.findUnique({ where: { id: data.id } });
      if (!current || current.deletedAt) {
        throw new NotFoundException('Message not found');
      }
      if (current.authorId !== data.authorId) {
        throw new ConflictException('Only the author can edit this message');
      }

      return tx.message.update({
        where: { id: data.id },
        data: {
          content: data.content,
          editedAt: new Date(),
          version: { increment: 1 },
        },
      });
    });
  }

  async softDelete(data: { id: string; authorId: string }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.message.findUnique({ where: { id: data.id } });
      if (!current || current.deletedAt) {
        throw new NotFoundException('Message not found');
      }
      if (current.authorId !== data.authorId) {
        throw new ConflictException('Only the author can delete this message');
      }

      await tx.message.update({
        where: { id: current.id },
        data: {
          deletedAt: new Date(),
          version: { increment: 1 },
        },
      });
    });
  }

  async listByThread(data: {
    threadId: string;
    limit: number;
    cursor?: string;
  }): Promise<{ items: Message[]; nextCursor?: string }> {
    const cursorObj = data.cursor
      ? (() => {
          const [createdAt, id] = Buffer.from(data.cursor, 'base64')
            .toString('utf8')
            .split(',');
          return { createdAt: new Date(createdAt), id };
        })()
      : undefined;

    const items = await this.prisma.message.findMany({
      where: { threadId: data.threadId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: data.limit,
      ...(cursorObj && {
        skip: 1,
        cursor: { createdAt_id: cursorObj },
      }),
    });

    let nextCursor: string | undefined;
    if (items.length === data.limit) {
      const last = items[items.length - 1];
      nextCursor = Buffer.from(
        `${last.createdAt.toISOString()},${last.id}`,
      ).toString('base64');
    }

    return { items, nextCursor };
  }

  private async validateIndempotencyKey(key?: string): Promise<Message | null> {
    if (key) {
      const existing = await this.prisma.message.findUnique({
        where: { idempotencyKey: key },
      });
      if (existing) return existing;
    }

    return null;
  }
}
