import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Post('create/:name')
  async crateBoard(@Param('name') _name: string) {
    return await this.boardService.createBoard(_name);
  }

  @Patch('update/:id')
  async updateBoardName(
    @Param('id') _hashedId: string,
    @Body('name') _name: string,
  ) {
    return await this.boardService.updateBoardName(_hashedId, _name);
  }

  @Delete('delete/:id')
  async deleteBoard(@Param('id') _hashedId: string) {
    return await this.boardService.deleteBoard(_hashedId);
  }

  //   @Get('find/:id')
  //   async loadBoard(@Param('id') _hashedId: string) {
  //     const boardDoc = this.boardService.findBoard(_hashedId);
  //     const cards =
  //   }
}
