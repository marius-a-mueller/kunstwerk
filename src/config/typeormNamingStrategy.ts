// https://github.com/tonivj5/typeorm-naming-strategies/blob/master/src/snake-naming.strategy.ts
// https://gist.github.com/recurrence/b6a4cb04a8ddf42eda4e4be520921bd2

import { DefaultNamingStrategy, type NamingStrategyInterface } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils.js';

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    override tableName(
        // eslint-disable-next-line unicorn/no-keyword-prefix
        className: string,
        userSpecifiedName: string | undefined,
    ) {
        return userSpecifiedName ?? snakeCase(className);
    }

    override columnName(
        propertyName: string,
        customName: string | undefined,
        embeddedPrefixes: string[],
    ) {
        return (
            snakeCase([...embeddedPrefixes, ''].join('_')) +
            (customName ?? snakeCase(propertyName))
        );
    }

    override relationName(propertyName: string) {
        return snakeCase(propertyName);
    }

    override joinColumnName(
        relationName: string,
        referencedColumnName: string,
    ) {
        return snakeCase(`${relationName}_${referencedColumnName}`);
    }

    // eslint-disable-next-line max-params
    override joinTableName(
        firstTableName: string,
        secondTableName: string,
        firstPropertyName: string,
        _: string,
    ) {
        return snakeCase(
            `${firstTableName}_${firstPropertyName.replaceAll(
                '.',
                '_',
            )}_${secondTableName}`,
        );
    }

    override joinTableColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string,
    ) {
        return snakeCase(`${tableName}_${columnName ?? propertyName}`);
    }

    // eslint-disable-next-line unicorn/no-keyword-prefix
    classTableInheritanceParentColumnName(
        parentTableName: any,
        parentTableIdPropertyName: any,
    ) {
        return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
    }

    eagerJoinRelationAlias(alias: string, propertyPath: string) {
        return `${alias}__${propertyPath.replace('.', '_')}`;
    }
}
