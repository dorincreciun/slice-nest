import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class GetProductsIds {
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined ? undefined : String(value).split(',').map(Number),
  )
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids?: number[];
}
