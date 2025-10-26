import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from './cards.service';
import { PrismaService } from '../prisma/prisma.service';
import { CardColumn, PrismaClient } from '@prisma/client';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

describe('CardsService', () => {
  let service: CardsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: PrismaService,
          useValue: {
            card: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              updateMany: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(
              async (fn: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
                await fn({
                  card: {
                    findMany: jest.fn(),
                    findUnique: jest.fn(),
                    updateMany: jest.fn(),
                    update: jest.fn(),
                    create: jest.fn(),
                    delete: jest.fn(),
                  },
                }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // ---------- CREATE ----------
  it('should create a card with next order number', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findMany: jest.fn().mockResolvedValue([{ id: '1', order: 1 }]),
            create: jest.fn().mockResolvedValue({ id: '2', order: 2 }),
          },
        }),
    );

    const result = await service.create('b1');
    expect(result.order).toBe(2);
  });

  it('should create the first card when none exist', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findMany: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: '1', order: 1 }),
          },
        }),
    );

    const result = await service.create('b1');
    expect(result.order).toBe(1);
  });

  // ---------- FIND ----------
  it('should find cards by board', async () => {
    (prisma.card.findMany as jest.Mock).mockResolvedValue([{ id: '1' }]);
    const result = await service.findByBoard('b1');
    expect(result).toEqual([{ id: '1' }]);
  });

  it('should find a single card', async () => {
    (prisma.card.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  // ---------- UPDATE CONTENT ----------
  it('should update card content', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue({ id: '1' }),
            update: jest
              .fn()
              .mockResolvedValue({ id: '1', title: 't', description: 'd' }),
          },
        }),
    );

    const result = await service.updateContent('1', 't', 'd');
    expect(result).toEqual({ id: '1', title: 't', description: 'd' });
  });

  it('should throw when updating non-existent card', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }),
    );

    await expect(service.updateContent('404', 't', 'd')).rejects.toThrow(
      'Card 404 not found',
    );
  });

  // ---------- REORDER COLUMN ----------
  it('should reorder cards within same column', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue({
              id: '1',
              boardId: 'b1',
              column: CardColumn.TODO,
              order: 2,
            }),
            findMany: jest.fn().mockResolvedValue([
              { id: '2', order: 1 },
              { id: '3', order: 3 },
            ]),
            updateMany: jest.fn(),
            update: jest.fn().mockResolvedValue({ id: '1', order: 1 }),
          },
        }),
    );

    const result = await service.reorderColumn('1', 1);
    expect(result.order).toBe(1);
  });

  it('should throw when newOrder is out of range', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue({
              id: '1',
              boardId: 'b1',
              column: CardColumn.TODO,
              order: 1,
            }),
            findMany: jest.fn().mockResolvedValue([]),
          },
        }),
    );

    await expect(service.reorderColumn('1', 5)).rejects.toThrow(
      'newOrder must be between 1 and 1',
    );
  });

  // ---------- CHANGE COLUMN ----------
  it('should move card to another column and reorder properly', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue({
              id: '1',
              boardId: 'b1',
              column: CardColumn.TODO,
              order: 2,
            }),
            findMany: jest
              .fn()
              .mockResolvedValueOnce([]) // target column empty
              .mockResolvedValueOnce([]),
            updateMany: jest.fn(),
            update: jest.fn().mockResolvedValue({
              id: '1',
              column: CardColumn.IN_PROGRESS,
              order: 1,
            }),
          },
        }),
    );

    const result = await service.changeColumn('1', CardColumn.IN_PROGRESS);
    expect(result.column).toBe(CardColumn.IN_PROGRESS);
    expect(result.order).toBe(1);
  });

  it('should throw if card not found when changing column', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }),
    );

    await expect(service.changeColumn('404', CardColumn.DONE)).rejects.toThrow(
      'Card 404 not found',
    );
  });

  // ---------- REMOVE ----------
  it('should delete card and reorder rest', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: {
            findUnique: jest.fn().mockResolvedValue({
              id: '1',
              boardId: 'b1',
              column: CardColumn.TODO,
              order: 2,
            }),
            updateMany: jest.fn(),
            delete: jest.fn().mockResolvedValue({ id: '1' }),
          },
        }),
    );

    const result = await service.remove('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should throw if deleting non-existent card', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          card: { findUnique: jest.fn().mockResolvedValue(null) },
        }),
    );

    await expect(service.remove('404')).rejects.toThrow('Card 404 not found');
  });
});
