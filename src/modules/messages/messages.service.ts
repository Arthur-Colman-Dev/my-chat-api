import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { IMessageService } from './messages.interface';
import { MessageRepository } from './ports/message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(private readonly repository: MessageRepository) {}

  async send(authorId: string, dto: CreateMessageDto): Promise<Message> {
    // Root or reply via same DTO: if parentId is present, route to reply
    if (dto.parentId) {
      return this.reply(authorId, {
        parentId: dto.parentId,
        content: dto.content,
        idempotencyKey: dto.idempotencyKey,
        metadata: dto.metadata,
      });
    }

    return this.repository.create({
      authorId,
      content: dto.content,
      idempotencyKey: dto.idempotencyKey,
      metadata: dto.metadata,
    });
  }

  async reply(authorId: string, dto: ReplyMessageDto): Promise<Message> {
    return this.repository.reply({
      authorId,
      parentId: dto.parentId,
      content: dto.content,
      idempotencyKey: dto.idempotencyKey,
      metadata: dto.metadata,
    });
  }

  async edit(authorId: string, dto: EditMessageDto): Promise<Message> {
    return await this.repository.edit({
      id: dto.id,
      authorId,
      content: dto.content,
    });
  }

  async remove(authorId: string, dto: DeleteMessageDto): Promise<void> {
    // Extra guard: ensure the message exists and is owned before soft-deleting
    const current = await this.repository.findById(dto.id);
    if (!current) throw new NotFoundException('Message not found');
    if (current.authorId !== authorId)
      throw new ForbiddenException('Not the message owner');

    await this.repository.softDelete({
      id: dto.id,
      authorId,
    });
  }

  async list(
    query: QueryMessagesDto,
  ): Promise<{ items: Message[]; nextCursor?: string }> {
    if (!query.threadId) {
      // Depending on your API design, you might support global feed later.
      throw new NotFoundException('threadId is required');
    }

    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 20;

    return this.repository.listByThread({
      threadId: query.threadId,
      limit,
      cursor: query.cursor,
    });
  }
}
