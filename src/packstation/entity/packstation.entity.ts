/**
 * Das Modul besteht aus der Entity Klasse
 * @packageDocumentation
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { Adresse } from './adresse.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { Paket } from './paket.entity.js';
import { dbType } from '../../config/db';

@Entity()
export class Packstation {
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ example: '12345', type: String })
    readonly nummer!: string;

    @Column('date')
    @ApiProperty({ example: '2021-06-01', type: Date })
    readonly baudatum: Date | undefined;

    @OneToMany(() => Paket, (paket) => paket.packstation, {
        cascade: ['insert', 'remove'],
    })
    readonly pakete: Paket[] | undefined;

    @OneToOne(() => Adresse, (adresse) => adresse.packstation, {
        cascade: ['insert', 'remove'],
    })
    readonly adresse: Adresse | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            nummer: this.nummer,
            baudatum: this.baudatum,
            erzeugt: this.erzeugt,
            aktualisiert: this.aktualisiert,
        });
}
