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
import { Job } from '../../job/entity/job.entity';

interface JobApplicationCreationAttributes {
  id: string;
  JobId: string;
  UserId: string;
}

@Table({ tableName: 'Job_Applications' })
export class JobApplication extends Model<
  JobApplication,
  JobApplicationCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Job)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  JobId: string;

  @BelongsTo(() => Job)
  job: Job;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  UserId: string;

  @BelongsTo(() => Users)
  user: Users;

  @CreatedAt
  @Column({ type: DataType.DATE })
  createdAt?: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt?: Date;
}
