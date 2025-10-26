import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, EachMessagePayload } from 'kafkajs';
import { ProductsService } from '../products/products.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly kafka = new Kafka({
    clientId: 'product-service',
    brokers: ['orderservice-kafka-1:9092'],
  });
  private readonly consumer = this.kafka.consumer({ groupId: 'product-service-group' });
  private readonly producer = this.kafka.producer();

  constructor(private readonly productsService: ProductsService) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.producer.connect();
    await this.consumer.subscribe({ topic: 'order_created', fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        if (topic === 'order_created') {
          const event = JSON.parse(message?.value?.toString() ?? '{}');
          console.log('📦 Evento recebido (order_created):', event);
          await this.handleOrderCreated(event);
        }
      },
    });
  }

  private async handleOrderCreated(event: any) {
    const { orderId, products } = event;
    let valid = true;

    for (const item of products) {
      try {
        await this.productsService.decreaseStock(item.productId, item.quantity);
      } catch (error) {
        valid = false;
        console.error(`Erro no estoque do produto ${item.productId}: ${error.message}`);
        break;
      }
    }

    if (valid) {
      await this.producer.send({
        topic: 'order_validated',
        messages: [{ value: JSON.stringify({ orderId, products }) }],
      });
    } else {
      await this.producer.send({
        topic: 'order_invalid',
        messages: [{ value: JSON.stringify({ orderId, products }) }],
      });
    }
  }
}
