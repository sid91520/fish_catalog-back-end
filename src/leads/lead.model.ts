import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { FishProduct } from '../fish-products/fish-product.model.js';

@Table({
  tableName: 'leads',
  indexes: [
    // Postgres does NOT auto-index foreign keys; this speeds joins/filters by product.
    { name: 'leads_product_id_idx', fields: ['productId'] },
    // findAll() sorts by createdAt DESC.
    { name: 'leads_created_at_idx', fields: ['createdAt'] },
    // Lookup by phone number (e.g. "has this customer ordered before?").
    { name: 'leads_mobile_number_idx', fields: ['mobileNumber'] },
  ],
})
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
