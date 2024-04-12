import { afterAll, beforeAll, describe, test } from '@jest/globals';
import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
    host,
    httpsAgent,
    loginPath,
    port,
    refreshPath,
    shutdownServer,
    startServer,
} from '../testserver.js';
import { HttpStatus } from '@nestjs/common';

// ------------------------ T e s t d a t e n ------------------------
const username = 'admin';
const password = 'p'; // NOSONAR
const passwordFalsch = 'FALSCH'; // NOSONAR

// ------------------------ T e s t s --------------------------------
// Test-Suite
// eslint-disable-next-line max-lines-per-function
describe('REST-Schnittstelle /login', () => {
    let client: AxiosInstance;

    // Testserver starten und dabei mit der DB verbinden
    beforeAll(async () => {
        await startServer();
        const baseURL = `https://${host}:${port}/`;
        client = axios.create({
            baseURL,
            httpsAgent,
            validateStatus: (status) => status < 500, // eslint-disable-line @typescript-eslint/no-magic-numbers
        });
    });

    afterAll(async () => {
        await shutdownServer();
    });

    test('Login mit korrektem Passwort', async () => {
        // given
        const body = `username=${username}&password=${password}`;

        // when
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { status, data }: AxiosResponse<{ access_token: string }> =
            await client.post(loginPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);

        const { access_token } = data; // eslint-disable-line camelcase, @typescript-eslint/naming-convention
        const tokenParts = access_token.split('.'); // eslint-disable-line camelcase

        expect(tokenParts).toHaveLength(3); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(access_token).toMatch(/^[a-z\d]+\.[a-z\d]+\.[\w-]+$/iu);
    });

    test('Login mit falschem Passwort', async () => {
        // given
        const body = `username=${username}&password=${passwordFalsch}`;

        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            loginPath,
            body,
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Login ohne Benutzerkennung', async () => {
        // given
        const body = '';

        // when
        const response: AxiosResponse<Record<string, any>> = await client.post(
            loginPath,
            body,
        );

        // then
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('Refresh', async () => {
        // given
        const loginBody = `username=${username}&password=${password}`;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const loginResponse: AxiosResponse<{ refresh_token: string }> =
            await client.post(loginPath, loginBody);
        const { refresh_token } = loginResponse.data; // eslint-disable-line camelcase, @typescript-eslint/naming-convention
        const body = `refresh_token=${refresh_token}`; // eslint-disable-line camelcase

        // when
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { status, data }: AxiosResponse<{ access_token: string }> =
            await client.post(refreshPath, body);

        // then
        expect(status).toBe(HttpStatus.OK);

        const { access_token } = data; // eslint-disable-line camelcase, @typescript-eslint/naming-convention
        const tokenParts = access_token.split('.'); // eslint-disable-line camelcase

        expect(tokenParts).toHaveLength(3); // eslint-disable-line @typescript-eslint/no-magic-numbers
        expect(access_token).toMatch(/^[a-z\d]+\.[a-z\d]+\.[\w-]+$/iu);
    });
});
