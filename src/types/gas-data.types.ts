import type { InferType } from 'yup';
import { GasDataSchema, GasDatumSchema } from './gas-data.schema';

export type GasDatum = InferType<typeof GasDatumSchema>;
export type GasData = InferType<typeof GasDataSchema>

export interface GasDataResponse {
  gasData: GasData,
}

export type GasDataMilesPerGallon = { endDateTimestamp: string, mpg: number };
