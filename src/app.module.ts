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

// Observe is optional: only enabled when real keys are provided via env.
export const observeEnabled = Boolean(
  process.env.OBSERVE_APP_KEY && process.env.OBSERVE_APP_SECRET,
);

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ...(observeEnabled
      ? [
          ObserveModule.forRoot({
            appKey: process.env.OBSERVE_APP_KEY!,
            appSecret: process.env.OBSERVE_APP_SECRET!,
            serviceId: 'fish-catalog-backend',
          }),
        ]
      : []),
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Hosted Postgres (Neon, Supabase, Render) gives one DATABASE_URL and needs SSL.
        const url = config.get<string>('DATABASE_URL');
        const useSsl = config.get('DB_SSL', url ? 'true' : 'false') === 'true';
        const common = {
          dialect: 'postgres' as const,
          models: [FishProduct, Lead, Admin],
          autoLoadModels: true,
          // Fine for testing; switch to migrations before production.
          synchronize: config.get('DB_SYNC', 'true') === 'true',
          dialectOptions: useSsl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        };
        if (url) return { ...common, uri: url };
        return {
          ...common,
          host: config.get('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 5433)),
          username: config.get('DB_USER', 'postgres'),
          password: config.get('DB_PASSWORD', 'root'),
          database: config.get('DB_NAME', 'fish_catalog'),
        };
      },
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
