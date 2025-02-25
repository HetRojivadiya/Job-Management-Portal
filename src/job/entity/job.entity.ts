import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Users } from '../../user/entity/users.entity';

@Table({ tableName: 'Jobs' })
export class Job extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  experience_level: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  salary_range: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  postedBy: string;

  @BelongsTo(() => Users)
  user: Users;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  deadline: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW, // Automatically sets `createdAt` to the current date
  })
  createdAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: DataType.NOW, // Automatically sets `updatedAt` to the current date
  })
  updatedAt?: Date;
}
