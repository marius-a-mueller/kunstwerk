
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { Packstation } from '../entity/packstation.entity.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { Public } from 'nest-keycloak-connect';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { type Suchkriterien } from '../service/suchkriterien.js';
import { getLogger } from '../../logger/logger.js';
import { Adresse } from '../entity/adresse.entity';

export interface IdInput {
    readonly id: number;
}

export interface SuchkriterienInput {
    readonly suchkriterien: Suchkriterien;
}

@Resolver((_: any) => Packstation)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class PackstationQueryResolver {
    readonly #service: PackstationReadService;

    readonly #logger = getLogger(PackstationQueryResolver.name);

    constructor(service: PackstationReadService) {
        this.#service = service;
    }

    @Query('packstation')
    @Public()
    async findById(@Args() { id }: IdInput) {
        this.#logger.debug('findById: id=%d', id);

        const packstation = await this.#service.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: packstation=%s, adresse=%o',
                packstation.toString(),
                packstation.Adresse,
            );
        }
        return packstation;
    }

    @Query('packstationen')
    @Public()
    async find(@Args() input: SuchkriterienInput | undefined) {
        this.#logger.debug('find: input=%o', input);
        const packstationen = await this.#service.find(input?.suchkriterien);
        this.#logger.debug('find: buecher=%o', packstationen);
        return packstationen;
    }

}
