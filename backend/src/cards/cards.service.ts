import { Injectable } from '@nestjs/common';
import { CardColumn } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prismaService: PrismaService) {}

  async create(boardId: string) {
    return await this.prismaService.$transaction(async (tx) => {
      const sameBoardCards = await tx.card.findMany({
        where: { boardId: boardId, column: CardColumn.TODO },
      });

      const maxOrder =
        sameBoardCards.length > 0
          ? Math.max(...sameBoardCards.map((card) => card.order))
          : 0;

      return tx.card.create({
        data: { order: maxOrder + 1, boardId },
      });
    });
  }

  findByBoard(boardId: string) {
    return this.prismaService.card.findMany({ where: { boardId: boardId } });
  }

  findOne(id: string) {
    return this.prismaService.card.findUnique({ where: { id: id } });
  }

  async updateContent(id: string, title: string, description: string) {
    return this.prismaService.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id } });
      if (!card) throw new Error(`Card ${id} not found`);

      return tx.card.update({
        where: { id },
        data: { title, description },
      });
    });
  }

  async reorderColumn(id: string, newOrder: number) {
    return this.prismaService.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id } });
      if (!card) throw new Error(`Card ${id} not found`);

      const columnCards = await tx.card.findMany({
        where: { boardId: card.boardId, column: card.column, NOT: { id } },
        orderBy: { order: 'asc' },
      });

      const count = columnCards.length + 1;

      if (newOrder < 1 || newOrder > count)
        throw new Error(`newOrder must be between 1 and ${count}`);

      if (card.order < newOrder) {
        await tx.card.updateMany({
          where: {
            boardId: card.boardId,
            column: card.column,
            order: { gt: card.order, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      } else if (card.order > newOrder) {
        await tx.card.updateMany({
          where: {
            boardId: card.boardId,
            column: card.column,
            order: { gte: newOrder, lt: card.order },
          },
          data: { order: { increment: 1 } },
        });
      }

      return tx.card.update({ where: { id }, data: { order: newOrder } });
    });
  }

  async changeColumn(id: string, newColumn: CardColumn) {
    return this.prismaService.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id } });
      if (!card) throw new Error(`Card ${id} not found`);

      const targetCards = await tx.card.findMany({
        where: { boardId: card.boardId, column: newColumn },
        orderBy: { order: 'asc' },
      });

      const newOrder = targetCards.length + 1;

      // Shift up orders in source column after removing the card
      await tx.card.updateMany({
        where: {
          boardId: card.boardId,
          column: card.column,
          order: { gt: card.order },
        },
        data: { order: { decrement: 1 } },
      });

      return tx.card.update({
        where: { id },
        data: { column: newColumn, order: newOrder },
      });
    });
  }

  async remove(id: string) {
    return this.prismaService.$transaction(async (tx) => {
      const card = await tx.card.findUnique({ where: { id } });
      if (!card) throw new Error(`Card ${id} not found`);

      await tx.card.updateMany({
        where: {
          boardId: card.boardId,
          column: card.column,
          order: { gt: card.order },
        },
        data: { order: { decrement: 1 } },
      });

      return tx.card.delete({ where: { id } });
    });
  }
}
