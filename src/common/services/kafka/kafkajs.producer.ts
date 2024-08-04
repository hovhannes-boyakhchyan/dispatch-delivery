import { IProducer } from './interfaces';
import { Kafka, Message, Partitioners, Producer } from 'kafkajs';
import { Logger } from '@nestjs/common';
import { sleep } from '../../utils';

export class KafkajsProducer implements IProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger: Logger;

  constructor(private readonly topic: string) {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.logger = new Logger(topic);
  }

  async produce(message: Message) {
    await this.producer.send({ topic: this.topic, messages: [message] });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (e) {
      this.logger.error('Failed to connect to Kafka.', e);
      await sleep(5000);
      await this.connect();
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
}
