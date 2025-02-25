import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Roles } from './roles.entity';

@Table
export class Users extends Model {
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
  username: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mobile: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Unauthorized',
  })
  status: string;

  @ForeignKey(() => Roles)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  roleId: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  twoFactorEnabled: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  twoFactorSecret: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isPopup: boolean;

  @BelongsTo(() => Roles)
  role: Roles;
}
