import { DataSource } from 'typeorm';

/**
 * Runs pending TypeORM migrations.
 *
 * Safe to call from multiple test suites: if the `migrations` table already
 * exists (because another suite already ran migrations on the same DB), we
 * simply skip — the schema is already up to date.
 */
export async function runMigrations(dataSource: DataSource): Promise<void> {
  try {
    await dataSource.runMigrations();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // PostgreSQL error: relation "migrations" already exists
    // This means a previous test suite already ran migrations — safe to ignore.
    if (message.includes('already exists') && message.includes('migrations')) {
      return;
    }
    throw err;
  }
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;
  await dataSource.query('SET session_replication_role = replica');
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
  }
  await dataSource.query('SET session_replication_role = DEFAULT');
}
