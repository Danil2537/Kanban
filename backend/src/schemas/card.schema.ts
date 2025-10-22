import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  order: number;

  @Prop()
  column: 'todo' | 'inprogress' | 'done';

  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  board: Types.ObjectId;
}
export type CardDocument = Card & Document;
export const CardSchema = SchemaFactory.createForClass(Card);
