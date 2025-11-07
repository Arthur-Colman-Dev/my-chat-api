import { IsString, MaxLength, IsUUID, IsNotEmpty } from 'class-validator';

export class EditMessageDto {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;

  version!: number;
}
