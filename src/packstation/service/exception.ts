// eslint-disable-next-line max-classes-per-file
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Packstationen, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Exception-Klasse für eine ungültige Packstationsnummer.
 */
export class PackstationNummerInvalidException extends HttpException {
    constructor(readonly nummer: string | undefined) {
        super(
            `Die Packstationsnummer ${nummer} ist ungültig oder nicht vorhanden.`,
            HttpStatus.NOT_FOUND,
        );
    }
}

/**
 * Exception-Klasse für eine nicht gefundene Packstation.
 */
export class PackstationNotFoundException extends HttpException {
    constructor(readonly id: number | undefined) {
        super(
            `Die Packstation mit der ID ${id} wurde nicht gefunden.`,
            HttpStatus.NOT_FOUND,
        );
    }
}

/**
 * Exception-Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export class VersionInvalidException extends HttpException {
    constructor(readonly version: string | undefined) {
        super(
            `Die Versionsnummer ${version} ist ungueltig.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}

/**
 * Exception-Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export class VersionOutdatedException extends HttpException {
    constructor(readonly version: number) {
        super(
            `Die Versionsnummer ${version} ist nicht aktuell.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}
