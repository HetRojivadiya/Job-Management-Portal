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
import { Job } from '../../user/entity/job.entity';
import { Skill } from './skills.entity';

@Table({ tableName: 'Job_skill' })
export class JobSkill extends Model<JobSkill> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  Job_id: string;

  @BelongsTo(() => Job)
  job: Job;

  @ForeignKey(() => Skill)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  skills_id: string;

  @BelongsTo(() => Skill)
  skill: Skill;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE })
  updatedAt: Date;
}
