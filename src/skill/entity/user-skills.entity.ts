import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Users } from '../../user/entity/users.entity';
import { Skill } from './skills.entity';

@Table({ tableName: 'User_Skill' })
export class UserSkill extends Model<UserSkill> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;

  @BelongsTo(() => Users)
  user: Users;

  @ForeignKey(() => Skill)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  skills_id: string;

  @BelongsTo(() => Skill)
  skill: Skill;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  proficiency_level: number;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt: Date;
}
