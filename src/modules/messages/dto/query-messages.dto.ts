import { IsOptional, IsUUID, IsInt, Min, IsString } from 'class-validator';

export class QueryMessagesDto {
  @IsOptional()
  @IsUUID()
  threadId?: string;

  // cursor pagination
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
