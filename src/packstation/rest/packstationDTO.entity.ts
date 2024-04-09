/* eslint-disable max-classes-per-file, @typescript-eslint/no-magic-numbers */

/*
 * Copyright (C) 2016 - present Juergen Zimmermann, Florian Goebel, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import {
    IsArray,
    IsISO8601,
    IsInt,
    IsOptional,
    ValidateNested,
} from 'class-validator';

import { AdresseDTO } from './adresseDTO.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { PaketDTO } from './paketDTO.entity.js';
import { Type } from 'class-transformer';

export const MAX_RATING = 5;

/**
 * Entity-Klasse für Packstationen ohne TypeORM und ohne Referenzen.
 */
export class PackstationDtoOhneRef {
    // https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s13.html
    @IsInt()
    @ApiProperty({ example: '12345', type: String })
    readonly nummer!: string;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2021-06-01' })
    readonly baudatum: Date | string | undefined;
}

/**
 * Entity-Klasse für Packstationen ohne TypeORM.
 */
export class PackstationDTO extends PackstationDtoOhneRef {
    @ValidateNested()
    @Type(() => AdresseDTO)
    @ApiProperty({ type: AdresseDTO })
    readonly adresse!: AdresseDTO; // NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaketDTO)
    @ApiProperty({ type: [PaketDTO] })
    readonly pakete: PaketDTO[] | undefined;

    // PaketDTO
}
/* eslint-enable max-classes-per-file, @typescript-eslint/no-magic-numbers */
