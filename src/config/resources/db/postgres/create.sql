-- docker compose exec postgres bash
-- psql --dbname=packstation --username=packstation --file=/scripts/create-table-packstation.sql

-- Indexe mit pgAdmin auflisten: "Query Tool" verwenden mit
--  SELECT   tablename, indexname, indexdef, tablespace
--  FROM     pg_indexes
--  WHERE    schemaname = 'packstation'
--  ORDER BY tablename, indexname;

-- https://www.postgresql.org/docs/devel/app-psql.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html
-- https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-CREATE
-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION packstation;

ALTER ROLE packstation SET search_path = 'packstation';

CREATE TABLE IF NOT EXISTS packstation (
    id                integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE packstationspace,
    version           integer NOT NULL DEFAULT 0,
    nummer            varchar(30) NOT NULL UNIQUE USING INDEX TABLESPACE packstationspace,
    baudatum          date,
    erzeugt           timestamp NOT NULL DEFAULT NOW(),
    aktualisiert      timestamp NOT NULL DEFAULT NOW()
) TABLESPACE packstationspace;

CREATE TABLE IF NOT EXISTS adresse (
    id                integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE packstationspace,
    strasse           varchar(32) NOT NULL,
    hausnummer        varchar(8) NOT NULL,
    postleitzahl      varchar(5) NOT NULL,
    stadt             varchar(32) NOT NULL,
    packstation_id    integer NOT NULL UNIQUE USING INDEX TABLESPACE packstationspace REFERENCES packstation
) TABLESPACE packstationspace;

CREATE TABLE IF NOT EXISTS paket (
    id                integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE packstationspace,
    nummer            varchar(30) NOT NULL UNIQUE,
    max_gewicht_in_kg decimal(8,2),
    packstation_id    integer NOT NULL REFERENCES packstation
) TABLESPACE packstationspace;
CREATE INDEX IF NOT EXISTS pakete_packstation_id_idx ON pakete(packstation_id) TABLESPACE packstationspace;
