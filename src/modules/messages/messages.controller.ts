// src/modules/messages/messages.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Message as DbMessage } from '@prisma/client';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { MessageView } from './entities/message.view';

// TODO: Replace this with the real auth decorator/guard later.
function getAuthorId(): string {
  // e.g., from request.user.sub
  return 'user_dev_01';
}

@Controller({ path: 'messages', version: '1' })
@UseInterceptors(ClassSerializerInterceptor)
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Post()
  async send(@Body() dto: CreateMessageDto): Promise<MessageView> {
    const authorId = getAuthorId();
    const entity = await this.service.send(authorId, dto);
    return this.toView(entity);
  }

  @Post(':id/reply')
  async reply(
    @Param('id') parentId: string,
    @Body() dto: Omit<ReplyMessageDto, 'parentId'>,
  ): Promise<MessageView> {
    const authorId = getAuthorId();
    const entity = await this.service.reply(authorId, {
      ...dto,
      parentId, // enforce parent from URL, ignore body parentId if present
    } as ReplyMessageDto);
    return this.toView(entity);
  }

  @Put(':id')
  async edit(
    @Param('id') id: string,
    @Body() dto: Omit<EditMessageDto, 'id'>,
  ): Promise<MessageView> {
    const authorId = getAuthorId();
    const entity = await this.service.edit(authorId, {
      id,
      ...dto,
    });
    return this.toView(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    const authorId = getAuthorId();
    const dto: DeleteMessageDto = { id };
    await this.service.remove(authorId, dto);
  }

  @Get()
  async list(
    @Query() query: QueryMessagesDto,
  ): Promise<{ items: MessageView[]; nextCursor?: string }> {
    const { items, nextCursor } = await this.service.list(query);
    return {
      items: items.map((m) => this.toView(m)),
      nextCursor,
    };
  }

  // ——— helpers ———

  private toView(m: DbMessage): MessageView {
    // Hide deleted content in responses
    const content = m.deletedAt ? '[deleted]' : m.content;
    return plainToInstance(MessageView, {
      ...m,
      content,
      _deletedAt: m.deletedAt,
    });
  }
}
