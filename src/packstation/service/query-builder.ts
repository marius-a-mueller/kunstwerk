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
import { getLogger } from '../../logger/logger.js';

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
    buildId(id: number) {
        // QueryBuilder "packstation" für Repository<Packstation>
        const queryBuilder = this.#repo.createQueryBuilder(
            this.#packstationAlias,
        );

        // Fetch-Join: aus QueryBuilder "packstation" die Property "adresse" ->  Tabelle "adresse"
        queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.adresse`,
            this.#adresseAlias,
        );

        // Fetch-Join: aus QueryBuilder "packstation" die Property "pakete" -> Tabelle "paket"
        queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.pakete`,
            this.#paketAlias,
        );

        queryBuilder.where(`${this.#packstationAlias}.id = :id`, { id });
        return queryBuilder;
    }

    /**
     * Packstationen asynchron suchen.
     * @param nummer Nummer der gesuchten Packstation
     * @param stadt Stadt der Packstation
     * @returns QueryBuilder
     */
    build({ nummer, stadt }: { nummer?: string; stadt?: string }) {
        this.#logger.debug('build: nummer=%s, stadt=%s', nummer, stadt);

        let queryBuilder = this.#repo.createQueryBuilder(
            this.#packstationAlias,
        );
        queryBuilder = queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.adresse`,
            this.#adresseAlias,
        );
        queryBuilder = queryBuilder.leftJoinAndSelect(
            `${this.#packstationAlias}.pakete`,
            this.#paketAlias,
        );

        let whereUsed = false;

        if (nummer !== undefined) {
            queryBuilder = queryBuilder.where(
                `${this.#packstationAlias}.nummer = :nummer`,
                { nummer },
            );
            whereUsed = true;
        }

        if (stadt !== undefined) {
            const whereOrAnd = whereUsed ? 'andWhere' : 'where';
            queryBuilder = queryBuilder[whereOrAnd](
                `${this.#adresseAlias}.stadt = :stadt`,
                { stadt },
            );
        }

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
