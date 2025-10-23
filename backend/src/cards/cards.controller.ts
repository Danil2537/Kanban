import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardColumn } from '@prisma/client';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  create(@Body() body: { boardId: string }) {
    return this.cardsService.create(body.boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch('updateContent/:id')
  updateContent(
    @Param('id') id: string,
    @Body() updatedData: { title: string; description: string },
  ) {
    return this.cardsService.updateContent(
      id,
      updatedData.title,
      updatedData.description,
    );
  }

  @Patch('reorder/:id')
  reorderColumn(@Param('id') id: string, @Body() body: { newOrder: number }) {
    return this.cardsService.reorderColumn(id, body.newOrder);
  }

  @Patch('changeColumn/:id')
  changeColumn(
    @Param('id') id: string,
    @Body() body: { newColumn: CardColumn; newOrder: number },
  ) {
    return this.cardsService.changeColumn(id, body.newColumn, body.newOrder);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}
