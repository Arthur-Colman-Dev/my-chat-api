// src/modules/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageRepository } from './ports/message.repository'; // your concrete repo file path

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MessageRepository],
  exports: [MessagesService],
})
export class MessagesModule {}
