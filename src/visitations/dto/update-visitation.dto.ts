import { PartialType } from '@nestjs/swagger';
import { CreateVisitationDto } from './create-visitation.dto.js';

export class UpdateVisitationDto extends PartialType(CreateVisitationDto) {}
