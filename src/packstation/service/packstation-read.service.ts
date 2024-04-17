/**
 * Das Modul besteht aus der Klasse {@linkcode PackstationReadService}.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Packstation } from '../entity/packstation.entity.js';
import { QueryBuilder } from './query-builder.js';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für `findById`
 */
export interface FindByIdParams {
    /** ID des gesuchten Pakets */
    readonly id: number;
    // Sollen die Pakete mitgeladen werden?
    readonly mitPaketen?: boolean;
}

@Injectable()
export class PackstationReadService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #packstationProps: string[];
    readonly #allowedSearchCriteria: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #logger = getLogger(PackstationReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        const packstationDummy = new Packstation();
        this.#packstationProps = Object.getOwnPropertyNames(packstationDummy);
        this.#queryBuilder = queryBuilder;

        this.#allowedSearchCriteria = [...this.#packstationProps, 'stadt'];
    }

    // TODO Mit Paketen implementieren
    async findById({ id, mitPaketen = false }: FindByIdParams) {
        this.#logger.debug('findById: id=%d', id);

        const packstation = await this.#queryBuilder
            .buildId({ id, mitPaketen })
            .getOne();
        if (packstation === null) {
            throw new NotFoundException(
                `Es gibt keine Packstation mit der ID ${id}.`,
            );
        }

        this.#logger.debug(
            'findById: packstation=%s, nummer=%o',
            packstation.toString(),
            packstation.nummer,
        );
        if (mitPaketen) {
            this.#logger.debug('findById: pakete=%o', packstation.pakete);
        }
        return packstation;
    }

    async find(suchkriterien?: Suchkriterien): Promise<Packstation[]> {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#queryBuilder.build({}).getMany();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#queryBuilder.build(suchkriterien).getMany();
        }

        // Falsche Namen für Suchkriterien?
        if (!this.#checkKeys(keys)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        const packstationen = await this.#queryBuilder
            .build(suchkriterien)
            .getMany();
        if (packstationen.length === 0) {
            this.#logger.debug('find: Keine Paketstationen gefunden');
            throw new NotFoundException(
                `Keine Paketstationen  gefunden${JSON.stringify(
                    suchkriterien,
                )}`,
            );
        }

        this.#logger.debug('find: packstationen=%o', packstationen);
        return packstationen;
    }

    #checkKeys(keys: string[]): boolean {
        let validKeys = true;
        keys.forEach((key) => {
            if (!this.#allowedSearchCriteria.includes(key)) {
                this.#logger.debug(
                    '#checkKeys: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
