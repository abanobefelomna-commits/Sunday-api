import { PartialType } from '@nestjs/mapped-types';
import { CreateServantDto } from './create-servant.dto.js';

export class UpdateServantDto extends PartialType(CreateServantDto) {}
