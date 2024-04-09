// eslint-disable-next-line max-classes-per-file
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard, Roles } from 'nest-keycloak-connect';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { type Packstation } from '../entity/packstation.entity.js';
import { PackstationDTO } from '../rest/PackstationDTO.entity.js';
import { PackstationWriteService } from '../service/packstation-write.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { type IdInput } from './packstation-query.resolver.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';

// Authentifizierung und Autorisierung durch
//  GraphQL Shield
//      https://www.graphql-shield.com
//      https://github.com/maticzav/graphql-shield
//      https://github.com/nestjs/graphql/issues/92
//      https://github.com/maticzav/graphql-shield/issues/213
//  GraphQL AuthZ
//      https://github.com/AstrumU/graphql-authz
//      https://www.the-guild.dev/blog/graphql-authz

export interface CreatePayload {
    readonly id: number;
}

export interface UpdatePayload {
    readonly version: number;
}

export class PackstationUpdateDTO extends PackstationDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}
@Resolver()
// alternativ: globale Aktivierung der Guards https://docs.nestjs.com/security/authorization#basic-rbac-implementation
@UseGuards(AuthGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class PackstationMutationResolver {
    readonly #service: PackstationWriteService;

    readonly #logger = getLogger(PackstationMutationResolver.name);

    constructor(service: PackstationWriteService) {
        this.#service = service;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async create(@Args('input') packstationDTO: PackstationDTO) {
        this.#logger.debug('create: packstationDTO=%o', packstationDTO);

        const packstation = this.#packstationDtoToPackstation(packstationDTO);
        const id = await this.#service.create(packstation);
        // TODO BadUserInputError
        this.#logger.debug('createPackstation: id=%d', id);
        const payload: CreatePayload = { id };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin', 'user'] })
    async update(@Args('input') packstationDTO: PackstationUpdateDTO) {
        this.#logger.debug('update: packstation=%o', packstationDTO);

        const packstation = this.#packstationUpdateDtoToPackstation(packstationDTO);
        const versionStr = `"${packstationDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(packstationDTO.id, 10),
            packstation,
            version: versionStr,
        });
        // TODO BadUserInputError
        this.#logger.debug('updatePackstation: versionResult=%d', versionResult);
        const payload: UpdatePayload = { version: versionResult };
        return payload;
    }

    @Mutation()
    @Roles({ roles: ['admin'] })
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const deletePerformed = await this.#service.delete(idStr);
        this.#logger.debug('deletePackstation: deletePerformed=%s', deletePerformed);
        return deletePerformed;
    }


    #packstationDtoToPackstation(packstationDTO: PackstationDTO): Packstation {
        const adresseDTO = packstationDTO.adresse;
        const adresse: Adresse = {
            id: undefined,
            strasse: adresseDTO.atrasse,
            hausnummer: adresseDTO.hausnummer,
            postleitzahl: adresseDTO.postleitzahl,
            stadt: adresseDTO.stadt,
            packstation: undefined,
        };
        const pakete = packstationDTO.abbildungen?.map((paketDTO) => {
            const paket: Paket = {
                id: undefined,
                nummer: paketDTO.nummer,
                maxGewichtInKg: paketDTO.maxGewichtInKg,
                packstation: undefined,
            };
            return paket;
        });
        const packstation: Packstation = {
            id: undefined,
            version: undefined,
            nummer: packstationDTO.nummer,
            baudatum: packstationDTO.baudatum,
            adresse,
            pakete,
            erzeugt: new Date(),
            aktualisiert: new Date(),
        };

        // Rueckwaertsverweis
        packstation.adresse!.packstation = packstation;
        return packstation;
    }

    #packstationUpdateDtoToPackstation(packstationDTO: PackstationUpdateDTO): Packstation {
        return {
            id: undefined,
            version: undefined,
            nummer: packstationDTO.nummer,
            baudatum: packstationDTO.baudatum,
            adresse: undefined,
            pakete: undefined,
            erzeugt: undefined,
            aktualisiert: new Date(),
        };
    }

}
