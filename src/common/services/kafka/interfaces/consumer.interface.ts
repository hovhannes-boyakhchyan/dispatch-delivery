export interface IConsumer {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  consume: (onMessage: (message: any) => Promise<void>) => Promise<void>;
}
