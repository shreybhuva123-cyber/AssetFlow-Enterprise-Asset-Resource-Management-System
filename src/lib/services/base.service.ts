import { createLogger } from '@/lib/logger/index';
import { normalizeError , AppError } from '@/types/errors';

export abstract class BaseService {
  protected readonly logger;

  constructor(protected readonly serviceName: string) {
    this.logger = createLogger(`Service:${this.serviceName}`);
  }

  protected async executeWithErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AppError) throw error;
      const normalized = normalizeError(error);
      this.logger.error(`${operation} failed`, { error: normalized.serialize() });
      throw normalized;
    }
  }

  protected executeSync<T>(operation: string, fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      if (error instanceof AppError) throw error;
      const normalized = normalizeError(error);
      this.logger.error(`${operation} failed`, { error: normalized.serialize() });
      throw normalized;
    }
  }
}
