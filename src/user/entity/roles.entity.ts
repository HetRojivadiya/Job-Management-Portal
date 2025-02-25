import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Users } from './users.entity';

@Table
export class Roles extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Candidate',
  })
  role: string;

  @HasMany(() => Users)
  users: Users[];
}
