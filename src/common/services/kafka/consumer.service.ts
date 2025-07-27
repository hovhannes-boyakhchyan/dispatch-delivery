import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { IConsumer, IKafkajsConsumerOptions } from './interfaces';
import { KafkajsConsumer } from './kafkajs.consumer';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];

  async consume({
    topics,
    config,
    onMessage,
  }: IKafkajsConsumerOptions): Promise<void> {
    const consumer = new KafkajsConsumer(topics, config);
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown(): Promise<void> {
    for (const consumer of this.consumers) {
      await consumer.disconnect;
    }
  }
}
