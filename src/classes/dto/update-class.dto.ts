import { PartialType } from '@nestjs/mapped-types';
import { CreateClassDto } from './create-class.dto.js';

export class UpdateClassDto extends PartialType(CreateClassDto) {}
