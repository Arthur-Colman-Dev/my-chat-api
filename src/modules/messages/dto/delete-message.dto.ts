import { IsUUID } from 'class-validator';

export class DeleteMessageDto {
  @IsUUID()
  id!: string;

  version?: number;
}
