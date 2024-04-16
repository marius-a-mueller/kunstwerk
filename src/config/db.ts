/**
 * Das Modul enthält die Konfiguration für das DB-System.
 * @packageDocumentation
 */
import { config } from './app.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const dbConfig = config.db;

type DbType = 'postgres' | 'mysql' | 'oracle' | 'sqlite';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const type: DbType | undefined = dbConfig?.type;

// 'better-sqlite3' erfordert node-gyp, wenn das Docker-Image gebaut wird
export const dbType =
    type === 'postgres' || type === 'sqlite' ? type : 'postgres';
