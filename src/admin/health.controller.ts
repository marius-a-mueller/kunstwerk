/**
 * Das Modul besteht aus der Controller-Klasse für Health-Checks.
 * @packageDocumentation
 */

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'nest-keycloak-connect';

/**
 * Die Controller-Klasse für Health-Checks.
 */
@Controller('health')
@Public()
@ApiTags('Health')
export class HealthController {
    readonly #health: HealthCheckService;

    readonly #typeorm: TypeOrmHealthIndicator;

    constructor(health: HealthCheckService, typeorm: TypeOrmHealthIndicator) {
        this.#health = health;
        this.#typeorm = typeorm;
    }

    @Get('liveness')
    @HealthCheck()
    @ApiOperation({ summary: 'Liveness prüfen' })
    live() {
        return this.#health.check([
            () => ({
                appserver: {
                    status: 'up',
                },
            }),
        ]);
    }

    @Get('readiness')
    @HealthCheck()
    @ApiOperation({ summary: 'Readiness prüfen' })
    ready() {
        return this.#health.check([() => this.#typeorm.pingCheck('db')]);
    }
}
