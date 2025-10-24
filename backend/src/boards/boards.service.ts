import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prismaService: PrismaService) {}

  async create() {
    return this.prismaService.$transaction(async (tx) => {
      return tx.board.create({ data: {} });
    });
  }

  findOne(id: string) {
    return this.prismaService.board.findUnique({
      where: { id },
      include: { cards: true },
    });
  }

  async updateTitle(id: string, updatedTitle: string) {
    return this.prismaService.$transaction(async (tx) => {
      const board = await tx.board.findUnique({ where: { id } });
      if (!board) throw new Error(`Board ${id} not found`);

      return tx.board.update({
        where: { id },
        data: { title: updatedTitle },
      });
    });
  }

  async remove(id: string) {
    return this.prismaService.$transaction(async (tx) => {
      return tx.board.delete({ where: { id } });
    });
  }
}
