import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'http';
interface CardResponse {
  id: string;
  boardId: string;
  order: number;
  title?: string;
  description?: string;
  column?: string;
}

interface BoardResponse {
  id: string;
  title?: string;
  cards?: CardResponse[];
}

describe('Cards E2E', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;
  let boardId: string;
  const createdCardIds: string[] = [];
  let server: Server;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = moduleRef.get(PrismaService);

    // Create a board for the tests
    const res = await request(server).post('/boards').send({});
    const board = res.body as BoardResponse;
    boardId = board.id;
  });

  afterAll(async () => {
    // Delete the board, which should cascade-delete related cards if your schema supports it
    await request(server).delete(`/boards/${boardId}`).send();

    await app.close();
  });

  it('should create a new card in TODO column', async () => {
    const res = await request(server).post(`/cards/${boardId}`).send({});
    const card = res.body as CardResponse;

    expect(res.status).toBe(201);
    expect(card.boardId).toBe(boardId);

    createdCardIds.push(card.id);
  });

  it('should update card content', async () => {
    // Use the first created card
    const cardId = createdCardIds[0];

    const res = await request(server)
      .patch(`/cards/updateContent/${cardId}`)
      .send({ title: 'New title', description: 'New description' });

    const updatedCard = res.body as CardResponse;
    expect(res.status).toBe(200);
    expect(updatedCard.title).toBe('New title');
    expect(updatedCard.description).toBe('New description');
  });

  it('should reorder a card', async () => {
    // Create another card to reorder
    const resCreate = await request(server).post(`/cards/${boardId}`).send({});
    const card2 = resCreate.body as CardResponse;
    createdCardIds.push(card2.id);

    const resReorder = await request(server)
      .patch(`/cards/reorder/${card2.id}`)
      .send({ newOrder: 1 });

    const reorderedCard = resReorder.body as CardResponse;
    expect(resReorder.status).toBe(200);
    expect(reorderedCard.order).toBe(1);
  });

  it('should change card column', async () => {
    const cardId = createdCardIds[0];

    const res = await request(server)
      .patch(`/cards/changeColumn/${cardId}`)
      .send({ newColumn: 'IN_PROGRESS' });

    const movedCard = res.body as CardResponse;
    expect(res.status).toBe(200);
    expect(movedCard.column).toBe('IN_PROGRESS');
  });

  it('should delete a card', async () => {
    const cardId = createdCardIds.pop()!;
    const res = await request(server).delete(`/cards/${cardId}`).send();

    const deletedCard = res.body as CardResponse;
    expect(res.status).toBe(200);
    expect(deletedCard.id).toBe(cardId);
  });
});
