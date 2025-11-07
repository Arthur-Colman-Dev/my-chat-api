import {
  IsString,
  MaxLength,
  IsOptional,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;

  // Optional: the client can send an idempotency key for safe retries
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  // Optional: allow creating root message and also a reply via same DTO (parentId=null for root)
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  metadata?: Prisma.InputJsonValue;
}
