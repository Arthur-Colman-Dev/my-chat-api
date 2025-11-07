import { Exclude, Expose } from 'class-transformer';

export class MessageView {
  @Expose() id!: string;
  @Expose() authorId!: string;
  @Expose() content!: string;

  @Expose() parentId!: string | null;
  @Expose() threadId!: string;
  @Expose() depth!: number;

  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
  @Expose() editedAt!: Date | null;
  @Exclude() _deletedAt?: Date | null;

  @Expose()
  get status(): 'ACTIVE' | 'EDITED' | 'DELETED' {
    return this._deletedAt ? 'DELETED' : this.editedAt ? 'EDITED' : 'ACTIVE';
  }

  @Expose() metadata?: Record<string, unknown>;
}
