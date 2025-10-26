import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

describe('BoardsService', () => {
  let service: BoardsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: PrismaService,
          useValue: {
            board: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn(
              async (fn: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
                await fn({
                  board: {
                    findUnique: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn(),
                    delete: jest.fn(),
                  },
                }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a new board', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          board: {
            create: jest
              .fn()
              .mockResolvedValue({ id: 'b1', title: 'New Board' }),
          },
        }),
    );

    const result = await service.create();
    expect(result).toEqual({ id: 'b1', title: 'New Board' });
  });

  it('should find a board by id', async () => {
    const spy = jest
      .spyOn(prisma.board, 'findUnique')
      .mockResolvedValue({ id: 'b1', title: 'My Board' });

    const result = await service.findOne('b1');
    expect(result).toEqual({ id: 'b1', title: 'My Board' });
    expect(spy).toHaveBeenCalledWith({
      where: { id: 'b1' },
      include: { cards: true },
    });
  });

  it('should return null if board not found', async () => {
    const spy = jest.spyOn(prisma.board, 'findUnique').mockResolvedValue(null);

    const result = await service.findOne('404');
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalledWith({
      where: { id: '404' },
      include: { cards: true },
    });
  });

  it('should update board title', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          board: {
            findUnique: jest.fn().mockResolvedValue({ id: 'b1', title: 'Old' }),
            update: jest.fn().mockResolvedValue({ id: 'b1', title: 'Updated' }),
          },
        }),
    );

    const result = await service.updateTitle('b1', 'Updated');
    expect(result.title).toBe('Updated');
  });

  it('should throw if updating a non-existent board', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          board: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }),
    );

    await expect(service.updateTitle('404', 'Updated')).rejects.toThrow(
      'Board 404 not found',
    );
  });

  it('should delete a board', async () => {
    (prisma.$transaction as jest.Mock).mockImplementationOnce(
      async (cb: (tx: DeepPartial<PrismaClient>) => Promise<unknown>) =>
        cb({
          board: {
            findUnique: jest.fn().mockResolvedValue({ id: 'b1' }),
            delete: jest.fn().mockResolvedValue({ id: 'b1' }),
          },
        }),
    );

    const result = await service.remove('b1');
    expect(result).toEqual({ id: 'b1' });
  });
});
