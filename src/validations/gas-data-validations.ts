import type { Schema } from 'yup';

export function validateSchema<T>(schema: Schema<T>, something: unknown): T {
  return schema.validateSync(something);
}
