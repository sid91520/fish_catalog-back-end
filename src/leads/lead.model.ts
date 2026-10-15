import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { FishProduct } from '../fish-products/fish-product.model.js';

@Table({ tableName: 'leads' })
export class Lead extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare mobileNumber: string;

  // Nullable: leads created before email was collected have none.
  @Column({ type: DataType.STRING, allowNull: true })
  declare email: string | null;

  @ForeignKey(() => FishProduct)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare productId: number;

  @BelongsTo(() => FishProduct)
  declare product: FishProduct;

  @Column({ type: DataType.DATE, allowNull: false })
  declare deliveryTime: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare address: string;
}
