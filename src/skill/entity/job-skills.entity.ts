import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Job } from '../../job/entity/job.entity';
import { Skill } from './skills.entity';

export interface JobSkillAttributes {
  id?: string; // Optional, since it will be auto-generated
  Job_id: string;
  skills_id: string;
}

@Table({ tableName: 'Job_skill' })
export class JobSkill extends Model {
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
}
