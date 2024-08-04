import { OnApplicationShutdown } from '@nestjs/common';
import { IProducer } from './interfaces';
import { Message } from 'kafkajs';
import { KafkajsProducer } from './kafkajs.producer';

export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();

  async produce(topic: string, message: Message) {
    const producer = await this.getProducer(topic);
    await producer.produce(message);
  }

  private async getProducer(topic: string): Promise<IProducer> {
    let producer = this.producers.get(topic);
    if (!producer) {
      producer = new KafkajsProducer(topic);
      await producer.connect();
      this.producers.set(topic, producer);
    }
    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
  }
}
