import { Model, Table, Column, DataType } from 'sequelize-typescript';

@Table({ tableName: 'Skills' })
export class Skill extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  skillName: string;
}
