import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { KafkaModule } from './kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';
import { Product } from './products/product.entity';
import { Category } from './categories/category.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'product-db',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'productdb',
        entities: [Product, Category],
        synchronize: true,
      }),
    }),
    ProductsModule,
    CategoriesModule,
    KafkaModule
  ],
})
export class AppModule {}