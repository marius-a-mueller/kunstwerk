/**
 * Das Modul enthält die Konfiguration für den Zugriff auf die DB.
 * @packageDocumentation
 */
import { BASEDIR, config } from './app.js';
import { type DataSourceOptions } from 'typeorm';
import { Packstation } from '../packstation/entity/packstation.entity.js';
import { SnakeNamingStrategy } from './typeormNamingStrategy.js';
import { dbType } from './db.js';
import { entities } from '../packstation/entity/entities.js';
import { loggerDefaultValue } from './logger.js';
import { nodeConfig } from './node.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { db } = config;

// nullish coalescing
const database =
    (db?.name as string | undefined) ?? Packstation.name.toLowerCase();

const host = (db?.host as string | undefined) ?? 'localhost';
const username =
    (db?.username as string | undefined) ?? Packstation.name.toLowerCase();
const pass = (db?.password as string | undefined) ?? 'p';
const passAdmin = (db?.passwordAdmin as string | undefined) ?? 'p';

// https://github.com/tonivj5/typeorm-naming-strategies/blob/master/src/snake-naming.strategy.ts
// https://github.com/typeorm/typeorm/blob/master/src/naming-strategy/DefaultNamingStrategy.ts
// https://github.com/typeorm/typeorm/blob/master/sample/sample12-custom-naming-strategy/naming-strategy/CustomNamingStrategy.ts
const namingStrategy = new SnakeNamingStrategy();

// logging bei TypeORM durch console.log()
const logging =
    (nodeConfig.nodeEnv === 'development' || nodeConfig.nodeEnv === 'test') &&
    !loggerDefaultValue;
const logger = 'advanced-console';

export const dbResourcesDir = resolve(nodeConfig.resourcesDir, 'db', dbType);
console.debug('dbResourcesDir = %s', dbResourcesDir);

// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
let dataSourceOptions: DataSourceOptions;
switch (dbType) {
    case 'postgres': {
        const cert = readFileSync(resolve(dbResourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
        dataSourceOptions = {
            type: 'postgres',
            host,
            port: 5432,
            username,
            password: pass,
            database,
            schema: username,
            poolSize: 10,
            entities,
            namingStrategy,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
        break;
    }
    // 'better-sqlite3' erfordert Python zum Uebersetzen, wenn das Docker-Image gebaut wird
    case 'sqlite': {
        const sqliteDatabase = resolve(
            BASEDIR,
            'config',
            'resources',
            'db',
            'sqlite',
            `${database}.sqlite`,
        );
        dataSourceOptions = {
            type: 'better-sqlite3',
            database: sqliteDatabase,
            entities,
            namingStrategy,
            logging,
            logger,
        };
        break;
    }
}
Object.freeze(dataSourceOptions);
export const typeOrmModuleOptions = dataSourceOptions;

if (!loggerDefaultValue) {
    // "rest properties" ab ES 2018: https://github.com/tc39/proposal-object-rest-spread
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, ssl, ...typeOrmModuleOptionsLog } =
        typeOrmModuleOptions as any;
    console.debug('typeOrmModuleOptions = %o', typeOrmModuleOptionsLog);
}

export const dbPopulate = db?.populate === true;
let adminDataSourceOptionsTemp: DataSourceOptions | undefined;
if (dbType === 'postgres') {
    const cert = readFileSync(resolve(dbResourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
    adminDataSourceOptionsTemp = {
        type: 'postgres',
        host,
        port: 5432,
        username: 'postgres',
        password: passAdmin,
        database,
        schema: database,
        namingStrategy,
        logging,
        logger,
        ssl: { cert },
        extra: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    };
}
export const adminDataSourceOptions = adminDataSourceOptionsTemp;
