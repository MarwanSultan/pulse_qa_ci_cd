import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';

export async function readJsonFile<TSchema extends z.ZodTypeAny>(
  relPathFromRepoRoot: string,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const abs = path.resolve(process.cwd(), relPathFromRepoRoot);
  const raw = await fs.readFile(abs, 'utf-8');
  const json = JSON.parse(raw) as unknown;
  return schema.parse(json);
}

export async function readCsvFile<TSchema extends z.ZodTypeAny>(
  relPathFromRepoRoot: string,
  rowSchema: TSchema,
): Promise<Array<z.infer<TSchema>>> {
  const abs = path.resolve(process.cwd(), relPathFromRepoRoot);
  const raw = await fs.readFile(abs, 'utf-8');

  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, unknown>>;

  return rows.map((r) => rowSchema.parse(r));
}

