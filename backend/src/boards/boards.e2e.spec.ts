import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'http';

interface BoardResponse {
  id: string;
  title?: string;
  cards?: any[];
}

describe('BoardsController (E2E)', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;
  let server: Server;
  let boardId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    // Cleanup: delete the board if it still exists
    if (boardId) {
      await request(server).delete(`/boards/${boardId}`).send();
    }
    await app.close();
  });

  it('should create a board', async () => {
    const res = await request(server).post('/boards').send();
    expect(res.status).toBe(201);

    const board = res.body as BoardResponse;
    expect(board.id).toBeDefined();
    boardId = board.id;
  });

  it('should find the created board', async () => {
    const res = await request(server).get(`/boards/${boardId}`).send();
    expect(res.status).toBe(200);

    const board = res.body as BoardResponse;
    expect(board.id).toBe(boardId);
  });

  it('should update the board title', async () => {
    const newTitle = 'Updated Board Title';
    const res = await request(server)
      .patch(`/boards/${boardId}`)
      .send({ updatedTitle: newTitle });

    expect(res.status).toBe(200);
    const updatedBoard = res.body as BoardResponse;
    expect(updatedBoard.title).toBe(newTitle);
  });

  it('should delete the board', async () => {
    const res = await request(server).delete(`/boards/${boardId}`).send();
    expect(res.status).toBe(200);

    const deletedBoard = res.body as BoardResponse;
    expect(deletedBoard.id).toBe(boardId);

    const getRes = await request(server).get(`/boards/${boardId}`).send();
    expect(getRes.status).toBe(200);
    expect(getRes.body).toEqual({});
  });
});
