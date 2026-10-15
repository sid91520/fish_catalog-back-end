import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { FishProduct } from './fish-products/fish-product.model.js';
import { Lead } from './leads/lead.model.js';
import { FishProductsModule } from './fish-products/fish-products.module.js';
import { LeadsModule } from './leads/leads.module.js';
import { Admin } from './admin/admin.model.js';
import { AdminModule } from './admin/admin.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { CacheModule } from './cache/cache.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'fish-catalog-backend',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres' as const,
        host: config.get('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5433)),
        username: config.get('DB_USER', 'postgres'),
        password: config.get('DB_PASSWORD', 'root'),
        database: config.get('DB_NAME', 'fish_catalog'),
        models: [FishProduct, Lead, Admin],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    CacheModule,
    FishProductsModule,
    LeadsModule,
    AdminModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
