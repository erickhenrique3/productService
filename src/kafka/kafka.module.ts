import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka.consumer';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [KafkaConsumerService],
})
export class KafkaModule {}
