import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
}

export const correlationContext = new AsyncLocalStorage<CorrelationContext>();