import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lead } from './lead.model.js';
import { FishProduct } from '../fish-products/fish-product.model.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';

export const DEFAULT_PAGE_SIZE = 104;

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead) private readonly leads: typeof Lead,
    @InjectModel(FishProduct) private readonly products: typeof FishProduct,
  ) {}

  async create(dto: CreateLeadDto) {
    const product = await this.products.findByPk(dto.productId);
    if (!product) {
      throw new NotFoundException(`Fish product ${dto.productId} not found`);
    }
    return this.leads.create({
      ...dto,
      deliveryTime: new Date(dto.deliveryTime),
    });
  }

  async findAll(page = 1, limit = DEFAULT_PAGE_SIZE) {
    const { rows, count } = await this.leads.findAndCountAll({
      include: [FishProduct],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    return {
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
