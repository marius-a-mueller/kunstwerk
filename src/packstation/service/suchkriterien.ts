/**
 * Das Modul besteht aus der Klasse {@linkcode PackstationReadService}.
 * @packageDocumentation
 */

export interface Suchkriterien {
    readonly nummer?: string;
    readonly baudatumVon?: Date;
    readonly baudatumBis?: Date;
    readonly hatPakete?: boolean;
    readonly stadt?: string;
}
