import {
  Kafka,
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  KafkaMessage,
} from 'kafkajs';
import { Logger } from '@nestjs/common';
import * as retry from 'async-retry';
import { IConsumer } from './interfaces';
import { sleep } from '../../utils';

export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(
    private readonly topics: ConsumerSubscribeTopics,
    config: ConsumerConfig,
  ) {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
    });
    this.consumer = this.kafka.consumer(config);
    this.logger = new Logger(`${topics.topics}-${config.groupId}`);
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
    } catch (e) {
      this.logger.error('Failed to connect to Kafka.', e);
      await sleep(5000);
      await this.connect();
    }
  }

  async consume(
    onMessage: (message: KafkaMessage) => Promise<void>,
  ): Promise<void> {
    await this.consumer.subscribe(this.topics);
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message partition: ${partition}`);
        try {
          await retry(async () => onMessage(message), {
            retries: 3,
            onRetry: (error, attempt) =>
              this.logger.error(
                `Error consuming message, executing retry ${attempt}/3...`,
                error,
              ),
          });
        } catch (e) {
          this.logger.error('Error consuming message:', e);
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }
}
