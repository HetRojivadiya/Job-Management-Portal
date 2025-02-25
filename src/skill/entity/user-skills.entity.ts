import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Users } from '../../user/entity/users.entity';
import { Skill } from './skills.entity';

@Table({ tableName: 'User_Skill' })
export class UserSkill extends Model {
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
}
