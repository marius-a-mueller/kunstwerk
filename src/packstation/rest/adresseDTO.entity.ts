/* eslint-disable @typescript-eslint/no-magic-numbers */

/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entity-Klasse für Adresse ohne TypeORM.
 */
export class AdresseDTO {
    @Matches('^\\w.*')
    @MaxLength(40)
    @ApiProperty({ example: 'Die Straße', type: String })
    readonly strasse!: string;

    @MaxLength(40)
    @ApiProperty({ example: 'Die Hausnummer', type: String })
    readonly hausnummer!: string;

    @MaxLength(10)
    @ApiProperty({ example: 'Die Postleitzahl', type: String })
    readonly postleitzahl!: string;

    @IsOptional()
    @MaxLength(40)
    @ApiProperty({ example: 'Die Stadt', type: String })
    readonly stadt: string | undefined;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
