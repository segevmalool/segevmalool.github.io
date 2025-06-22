import { type Connectable, connectable, Observable, ReplaySubject, Subscriber } from 'rxjs';

import { GasDataKey } from '../gas-data-constants';
import type { GasDataResponse, GasDatum, GasData } from '../types/gas-data.types';
import { validateSchema } from '../validations/gas-data-validations';
import { GasDataSchema, GasDatumSchema } from '../types/gas-data.schema';

// This class combines a rxjs observable with an event emitter in order to provide a pub-sub interface.
// I didn't use a Subject intentionally. tyvm.
export class GasDataPersistence {
  private static instance: GasDataPersistence;
  private gasData$: Connectable<GasDataResponse> =
    connectable(new Observable(this.initializeGasDataObservable.bind(this)), {
      connector: () => new ReplaySubject<GasDataResponse>(1),
    });
  private subscriber: Subscriber<GasDataResponse> | null = null;

  public get getGasData$(): Connectable<GasDataResponse> {
    return this.gasData$;
  }

  public static getInstance() {
    if (GasDataPersistence.instance) {
      return GasDataPersistence.instance;
    }

    GasDataPersistence.instance = new this();
    GasDataPersistence.instance.getGasData$.connect();
    return GasDataPersistence.instance;
  }

  public addRecord(gasDatum: GasDatum) {
    if (!this.subscriber) {
      console.error('Failed to add record: Subscriber not initialized');
      return;
    }
    const validatedGasDatum = validateSchema(GasDatumSchema, gasDatum)
    this.addGasDatum(validatedGasDatum);
    this.subscriber.next({ gasData: this.readGasData() });
  }

  public deleteByTimestamp(timestamp: string) {
    if (!this.subscriber) {
      console.error('Failed to add record: Subscriber not initialized');
      return;
    }

    let gasData = this.readGasData();

    const indexOfGasRecord = gasData.findIndex((gasRecord: GasDatum) => gasRecord.timeStamp === timestamp);

    if (indexOfGasRecord < 0) {
      throw new Error('Can\'t find gas record with given timestamp');
    }

    gasData.splice(indexOfGasRecord, 1);

    this.overwriteGasData(gasData);

    this.subscriber.next({ gasData: this.readGasData() });
  }

  public overwriteGasData(gasData: GasData) {
    if (!this.subscriber) {
      console.error('Failed to add record: Subscriber not initialized');
      return;
    }

    const validatedGasData = validateSchema<GasData>(GasDataSchema, gasData)
    localStorage.setItem(GasDataKey, JSON.stringify(validatedGasData));
    this.subscriber.next({ gasData: this.readGasData() });
  }

  // Called every time a subscription is created.
  private initializeGasDataObservable(subscriber: Subscriber<GasDataResponse>) {
    this.subscriber = subscriber;
    subscriber.next({ gasData: this.readGasData() });
  }

  private addGasDatum(something: GasDatum): void {
    let gasRawData = localStorage.getItem(GasDataKey);
    if (!gasRawData) {
      gasRawData = '[]';
    }
    const gasArray = JSON.parse(gasRawData);
    gasArray.push(something);
    const newGasRawData = JSON.stringify(gasArray);
    localStorage.setItem(GasDataKey, newGasRawData)
  }

  private readGasData(): GasDatum[] {
    const rawData = localStorage.getItem(GasDataKey);

    if (!rawData) {
      return [];
    }

    return JSON.parse(rawData);
  }
}
