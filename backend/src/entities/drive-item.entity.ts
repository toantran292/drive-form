import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Form } from './form.entity';
import { QueryRunner } from 'typeorm';
import { getRepository } from 'typeorm';
import { In, ArrayContains } from 'typeorm';

export enum DriveItemType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  FORM = 'FORM',
}

@Entity('drive_items')
export class DriveItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DriveItemType,
  })
  type: DriveItemType;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  storagePath: string;

  @Column({ nullable: true })
  downloadUrl: string;

  @ManyToOne(() => User)
  owner: User;

  @Column()
  ownerId: string;

  @ManyToOne(() => DriveItem, { nullable: true })
  parent: DriveItem;

  @Column({ nullable: true })
  parentId?: string;

  @OneToMany(() => DriveItem, (item) => item.parent)
  children: DriveItem[];

  @Column('text', { array: true, default: [] })
  descendantIds: string[];

  @Column('jsonb', { default: {} })
  descendants: {
    files: number;
    folders: number;
    forms: number;
    totalSize: number;
  };

  @Column('jsonb', { default: [] })
  sharedWith: Array<{
    userId: string;
    permission: 'read' | 'write';
    inheritedFrom?: string;
  }>;

  @Column({ nullable: true })
  formId: string;

  @ManyToOne(() => Form, { nullable: true })
  form: Form;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true, unique: true })
  shareId: string;

  /**
   * Cập nhật thông tin descendants
   */
  async updateDescendantsInfo(queryRunner?: QueryRunner) {
    if (this.type !== DriveItemType.FOLDER) return;

    const descendants = await this.getAllDescendants(queryRunner);

    // Cập nhật descendantIds
    this.descendantIds = descendants.map((d) => d.id);

    // Cập nhật thống kê
    this.descendants = {
      files: descendants.filter((d) => d.type === DriveItemType.FILE).length,
      folders: descendants.filter((d) => d.type === DriveItemType.FOLDER)
        .length,
      forms: descendants.filter((d) => d.type === DriveItemType.FORM).length,
      totalSize: descendants.reduce((sum, d) => sum + (d.size || 0), 0),
    };
  }

  /**
   * Lấy tất cả items con cháu
   */
  private async getAllDescendants(
    queryRunner?: QueryRunner,
  ): Promise<DriveItem[]> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(DriveItem)
      : getRepository(DriveItem);

    const descendants: DriveItem[] = [];
    const queue = [this.id];

    while (queue.length > 0) {
      const currentId = queue.shift();
      const children = await repository.find({
        where: { parentId: currentId },
      });

      for (const child of children) {
        descendants.push(child);
        if (child.type === DriveItemType.FOLDER) {
          queue.push(child.id);
        }
      }
    }

    return descendants;
  }

  /**
   * Cập nhật quyền chia sẻ cho tất cả con cháu
   */
  async propagateSharing(
    userId: string,
    permission: 'read' | 'write',
    queryRunner?: QueryRunner,
  ) {
    if (this.type !== DriveItemType.FOLDER) return;

    const repository = queryRunner
      ? queryRunner.manager.getRepository(DriveItem)
      : getRepository(DriveItem);

    // Cập nhật tất cả descendants
    await repository.update(
      { id: In(this.descendantIds) },
      {
        sharedWith: [
          ...this.sharedWith.filter((s) => s.userId !== userId),
          { userId, permission, inheritedFrom: this.id },
        ],
      },
    );
  }

  /**
   * Xóa quyền chia sẻ cho tất cả con cháu
   */
  async removeSharing(userId: string, queryRunner?: QueryRunner) {
    if (this.type !== DriveItemType.FOLDER) return;

    const repository = queryRunner
      ? queryRunner.manager.getRepository(DriveItem)
      : getRepository(DriveItem);

    // Xóa sharing cho các items kế thừa từ folder này
    await repository.update(
      {
        id: In(this.descendantIds),
        sharedWith: ArrayContains([{ userId, inheritedFrom: this.id }]),
      },
      {
        sharedWith: () => `sharedWith - jsonb_array_elements(sharedWith) 
                    FILTER (WHERE (value->>'userId')::text = '${userId}' 
                    AND (value->>'inheritedFrom')::text = '${this.id}')`,
      },
    );
  }
}
