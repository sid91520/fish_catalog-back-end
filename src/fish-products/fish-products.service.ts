import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FishProduct } from './fish-product.model.js';
import { CreateFishProductDto } from './dto/create-fish-product.dto.js';
import { UpdateFishProductDto } from './dto/update-fish-product.dto.js';
import { CacheService } from '../cache/cache.service.js';

const LIST_KEY = 'fish-products:list';
const itemKey = (id: number) => `fish-products:item:${id}`;
const TTL_SECONDS = 300;

@Injectable()
export class FishProductsService {
  constructor(
    @InjectModel(FishProduct) private readonly products: typeof FishProduct,
    private readonly cache: CacheService,
  ) {}

  async create(dto: CreateFishProductDto) {
    const product = await this.products.create({ ...dto });
    await this.cache.del(LIST_KEY);
    return product;
  }
  findAll() {
    return this.cache.wrap(LIST_KEY, TTL_SECONDS, async () =>
      (await this.products.findAll({ order: [['createdAt', 'DESC']] })).map(
        (p) => p.toJSON(),
      ),
    );
  }

  findOne(id: number) {
    return this.cache.wrap(itemKey(id), TTL_SECONDS, async () => {
      const product = await this.products.findByPk(id);
      if (!product) throw new NotFoundException(`Fish product ${id} not found`);
      return product.toJSON();
    });
  }

  async update(id: number, dto: UpdateFishProductDto) {
    const product = await this.products.findByPk(id);
    if (!product) throw new NotFoundException(`Fish product ${id} not found`);
    const updated = await product.update({ ...dto });
    await this.cache.del(LIST_KEY, itemKey(id));
    return updated;
  }

  async remove(id: number) {
    const product = await this.products.findByPk(id);
    if (!product) throw new NotFoundException(`Fish product ${id} not found`);
    await product.destroy();
    await this.cache.del(LIST_KEY, itemKey(id));
    return { deleted: true };
  }
}
