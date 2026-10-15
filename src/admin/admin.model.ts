import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'admins' })
export class Admin extends Model {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  /** scrypt hash in the form `salt:hash` (hex). Never returned by the API. */
  @Column({ type: DataType.STRING, allowNull: false })
  declare passwordHash: string;
}
