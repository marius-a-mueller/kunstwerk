/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder} für Packstationen.
 * @packageDocumentation
 */

import { Adresse } from '../entity/adresse.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Packstation } from '../entity/packstation.entity.js';
import { Paket } from '../entity/paket.entity.js';
import { Repository } from 'typeorm';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';

/** Typdefinitionen für die Suche mit der Packstation-ID. */
export interface BuildIdParams {
    /** ID der gesuchten Packstation. */
    readonly id: number;
    /** Sollen die Pakete mitgeladen werden? */
    readonly mitPaketen?: boolean;
}

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Packstationen und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #packstationAlias = `${Packstation.name
        .charAt(0)
        .toLowerCase()}${Packstation.name.slice(1)}`;

    readonly #adresseAlias = `${Adresse.name
        .charAt(0)
        .toLowerCase()}${Adresse.name.slice(1)}`;

    readonly #paketAlias = `${Paket.name
        .charAt(0)
        .toLowerCase()}${Paket.name.slice(1)}`;

    readonly #repo: Repository<Packstation>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Packstation) repo: Repository<Packstation>) {
        this.#repo = repo;
    }

    /**
     * Eine Packstation mit der ID suchen.
     * @param id ID der gesuchten Packstation
     * @returns QueryBuilder
     */
    buildId({ id, mitPaketen = false }: BuildIdParams) {
        // QueryBuilder "packstation" für Repository<Packstation>
        const queryBuilder = this.#repo.createQueryBuilder(
            this.#packstationAlias,
        );

        // Fetch-Join: aus QueryBuilder "packstation" die Property "adresse" ->  Tabelle "adresse"
        queryBuilder.innerJoinAndSelect(
            `${this.#packstationAlias}.adresse`,
            this.#adresseAlias,
        );

        if (mitPaketen) {
            // Fetch-Join: aus QueryBuilder "packstation" die Property "pakete" -> Tabelle "pakete"
            queryBuilder.leftJoinAndSelect(
                `${this.#packstationAlias}.pakete`,
                this.#paketAlias,
            );
        }

        queryBuilder.where(`${this.#packstationAlias}.id = :id`, { id });
        return queryBuilder;
    }

    /**
     * Packstationen asynchron suchen.
     * @param nummer Nummer der gesuchten Packstation
     * @param stadt Stadt der Packstation
     * @returns QueryBuilder
     */
    // eslint-disable-next-line max-lines-per-function,
    build({ nummer, baudatum, hatPakete, stadt }: Suchkriterien) {
        this.#logger.debug(
            'build: nummer=%s, baudatum=%o, hatPakete=%s, stadt=%s',
            nummer,
            baudatum,
            hatPakete,
            stadt,
        );

        let queryBuilder = this.#repo.createQueryBuilder(
            this.#packstationAlias,
        );
        queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.adresse`,
            this.#adresseAlias,
        );
        queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.pakete`,
            this.#paketAlias,
        );

        let useWhere = true; // Steuert, ob 'where' oder 'andWhere' verwendet wird

        if (nummer !== undefined) {
            queryBuilder = queryBuilder.where(
                `${this.#packstationAlias}.nummer = :nummer`,
                { nummer },
            );
            useWhere = false;
        }

        if (baudatum !== undefined) {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#packstationAlias}.baudatum = :baudatum`,
                      { baudatum },
                  )
                : queryBuilder.andWhere(
                      `${this.#packstationAlias}.baudatum = :baudatum`,
                      { baudatum },
                  );
            useWhere = false;
        }

        if (hatPakete !== undefined) {
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#paketAlias}.id IS ${hatPakete ? 'NOT' : ''} NULL`,
                  )
                : queryBuilder.andWhere(
                      `${this.#paketAlias}.id IS ${hatPakete ? 'NOT' : ''} NULL`,
                  );
            useWhere = false;
        }

        if (stadt !== undefined) {
            queryBuilder = queryBuilder.where(
                `${this.#adresseAlias}.stadt = :stadt`,
                {
                    stadt,
                },
            );
            useWhere = false;
        }

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
