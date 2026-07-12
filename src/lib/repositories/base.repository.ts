import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger/index';
import { NotFoundError, DatabaseError } from '@/lib/errors/index';
import type { OffsetPaginationParams, PaginatedResult } from '@/types/pagination';
import { getPrismaSkipTake, buildPaginatedResult } from '@/lib/utils/pagination';

export abstract class BaseRepository<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereInput = Record<string, unknown>,
> {
  protected readonly prisma: PrismaClient = prisma;
  protected readonly logger = createLogger(`Repository:${this.modelName}`);

  constructor(protected readonly modelName: string) {}

  protected abstract getDelegate(): {
    findUnique: (args: { where: { id: string } }) => Promise<TModel | null>;
    findMany: (args: {
      where?: TWhereInput;
      skip?: number;
      take?: number;
      orderBy?: unknown;
    }) => Promise<TModel[]>;
    count: (args: { where?: TWhereInput }) => Promise<number>;
    create: (args: { data: TCreateInput }) => Promise<TModel>;
    update: (args: { where: { id: string }; data: TUpdateInput }) => Promise<TModel>;
    delete: (args: { where: { id: string } }) => Promise<TModel>;
  };

  async findById(id: string): Promise<TModel | null> {
    try {
      return await this.getDelegate().findUnique({ where: { id } });
    } catch (error) {
      this.logger.error(`findById failed for id=${id}`, { error });
      throw new DatabaseError(`Failed to find ${this.modelName} by id`, { cause: error });
    }
  }

  async findByIdOrThrow(id: string): Promise<TModel> {
    const record = await this.findById(id);
    if (!record) throw new NotFoundError(this.modelName);
    return record;
  }

  async findMany(
    where?: TWhereInput,
    orderBy?: unknown,
  ): Promise<TModel[]> {
    try {
      return await this.getDelegate().findMany({ where, orderBy });
    } catch (error) {
      this.logger.error('findMany failed', { error });
      throw new DatabaseError(`Failed to list ${this.modelName}`, { cause: error });
    }
  }

  async findPaginated(
    params: OffsetPaginationParams,
    where?: TWhereInput,
    orderBy?: unknown,
  ): Promise<PaginatedResult<TModel>> {
    try {
      const { skip, take } = getPrismaSkipTake(params.page, params.pageSize);
      const [data, total] = await Promise.all([
        this.getDelegate().findMany({ where, skip, take, orderBy }),
        this.getDelegate().count({ where }),
      ]);
      return buildPaginatedResult(data, total, params);
    } catch (error) {
      this.logger.error('findPaginated failed', { error });
      throw new DatabaseError(`Failed to paginate ${this.modelName}`, { cause: error });
    }
  }

  async count(where?: TWhereInput): Promise<number> {
    try {
      return await this.getDelegate().count({ where });
    } catch (error) {
      this.logger.error('count failed', { error });
      throw new DatabaseError(`Failed to count ${this.modelName}`, { cause: error });
    }
  }

  async create(data: TCreateInput): Promise<TModel> {
    try {
      return await this.getDelegate().create({ data });
    } catch (error) {
      this.logger.error('create failed', { error });
      throw new DatabaseError(`Failed to create ${this.modelName}`, { cause: error });
    }
  }

  async update(id: string, data: TUpdateInput): Promise<TModel> {
    try {
      return await this.getDelegate().update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`update failed for id=${id}`, { error });
      throw new DatabaseError(`Failed to update ${this.modelName}`, { cause: error });
    }
  }

  async delete(id: string): Promise<TModel> {
    try {
      return await this.getDelegate().delete({ where: { id } });
    } catch (error) {
      this.logger.error(`delete failed for id=${id}`, { error });
      throw new DatabaseError(`Failed to delete ${this.modelName}`, { cause: error });
    }
  }
}
