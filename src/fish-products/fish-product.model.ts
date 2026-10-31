import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'fish_products',
  indexes: [
    // findAll() sorts by createdAt DESC; an index lets Postgres read rows already sorted.
    { name: 'fish_products_created_at_idx', fields: ['createdAt'] },
  ],
})
export class FishProduct extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare image: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  declare discountPrice: number | null;
}
