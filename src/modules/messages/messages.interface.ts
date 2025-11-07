import { Message } from '@prisma/client';

import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

export interface IMessageService {
  send(authorId: string, dto: CreateMessageDto): Promise<Message>;
  reply(authorId: string, dto: ReplyMessageDto): Promise<Message>;
  edit(authorId: string, dto: EditMessageDto): Promise<Message>;
  remove(authorId: string, dto: DeleteMessageDto): Promise<void>;
  list(
    query: QueryMessagesDto,
  ): Promise<{ items: Message[]; nextCursor?: string }>;
}
