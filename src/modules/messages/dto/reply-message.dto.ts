import {
  IsString,
  MaxLength,
  IsUUID,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Prisma } from '@prisma/client';

export class ReplyMessageDto {
  @IsUUID()
  parentId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsOptional()
  metadata?: Prisma.InputJsonValue;
}
