import { css, html, LitElement } from 'lit';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { state, property } from 'lit/decorators.js';

import { Subscription } from 'rxjs';


import { GasDataPersistence } from '../persistence/gas-data-persistence';
import type { GasDataResponse, GasDatum, GasData } from '../types/gas-data.types';

import './gas-data-analytics-dashboard';

export class GasDataApp extends LitElement {
  static styles = css`
      table, td, th {
          border: 1px solid black;
      }
      
      td, th {
          padding: 10px;
      }
      
      .indicateAction:hover {
          background-color: chartreuse;
          cursor: pointer;
      }
  `;
  private carMileageRef: Ref<HTMLInputElement> = createRef();
  private gasAmountRef: Ref<HTMLInputElement> = createRef();
  private gasCostRef: Ref<HTMLInputElement> = createRef();
  private gasDataSubscription?: Subscription;
  @state()
  private gasData?: GasData;
  @state()
  private showAddRecordForm: boolean = false;
  @state()
  private showDashboard: boolean = false;
  @property()
  private storagePersisted: boolean = false;

  public async connectedCallback() {
    super.connectedCallback();
    this.storagePersisted = await navigator.storage.persisted();
    if (!this.storagePersisted) {
      console.log('hello')
      // This line will request access from the user. If it's not granted, idk.
      this.storagePersisted = await navigator.storage.persist();
      console.log(this.storagePersisted)
    }
    await this.subscribeGasData();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.gasDataSubscription?.unsubscribe();
  }

  public render() {
    return html`
      ${this.getPersistenceWarning()}
      ${this.getGasDataControlPanel()}
      ${this.showAddRecordForm ? this.getAddGasDatumForm() : null}
      ${this.showDashboard ? this.getDataVis() : null}
      ${this.getGasDataTable()}
    `
  }

  private async subscribeGasData() {
    this.gasDataSubscription = GasDataPersistence.getInstance().getGasData$.subscribe((gasDataObservation: GasDataResponse) => {
      if (!gasDataObservation.gasData) {
        throw new Error('received empty gas data')
      }

      this.gasData = gasDataObservation.gasData;
    });
  }

  private async submitGasDatum(): Promise<void> {
    const timeStamp = new Date().toISOString();

    const gasDatum: GasDatum = {
      timeStamp,
      carMileage: Number(this.carMileageRef.value?.value),
      gasAmount: Number(this.gasAmountRef.value?.value),
      gasCost: Number(this.gasCostRef.value?.value),
    };

    GasDataPersistence.getInstance().addRecord(gasDatum);
  }

  private async deleteGasRecord(event: PointerEvent) {
    const timeStamp = (event.target as HTMLElement)?.id;

    if (!timeStamp) {
      throw new Error('Failed to delete event, element timestamp does not exist');
    }

    GasDataPersistence.getInstance().deleteByTimestamp(timeStamp);
  }

  private async downloadGasData() {
    const { showSaveFilePicker } = window;
    if (!showSaveFilePicker) {
      alert('Missing file system access api. Try using Chrome/Chromium.');
      return;
    }
    const newHandle = await showSaveFilePicker();
    const writableStream = await newHandle.createWritable();
    await writableStream.write(JSON.stringify(this.gasData));
    await writableStream.close();
  }

  private async importGasData() {
    const { showOpenFilePicker } = window;
    if (!showOpenFilePicker) {
      alert('Missing file system access api. Try using Chrome/Chromium.');
      return;
    }
    const confirmed = confirm('You will lose your existing data. Proceed?')
    if (!confirmed) {
      return;
    }
    const [ newHandle ] = await showOpenFilePicker();
    const gasDataFile = await newHandle.getFile()
    const gasDataText = await gasDataFile.text();
    const gasDataCandidate = JSON.parse(gasDataText);
    GasDataPersistence.getInstance().overwriteGasData(gasDataCandidate);
  }

  private getGasDataTable() {
    return html`
      <h2>Your Gas Data</h2>
      <table>
        <tr>
          <th>Car Mileage</th>
          <th>Gas Amount Purchased</th>
          <th>Gas Total Cost</th>
          <th>Date and Time</th>
          <th>Actions</th>
        </tr>
        ${this.gasData?.map((gasDatum: GasDatum) =>
            html`
              <tr>
                <td>${gasDatum.carMileage}</td>
                <td>${gasDatum.gasAmount}</td>
                <td>${gasDatum.gasCost}</td>
                <td>${new Date(gasDatum.timeStamp).toLocaleDateString()} ${new Date(gasDatum.timeStamp).toLocaleTimeString()}</td>
                <td><span id="${gasDatum.timeStamp}" class="indicateAction" @click="${this.deleteGasRecord}">Delete</span></td>
              </tr>
            `
        )}
      </table>
      <hr>
    `;
  }

  private getAddGasDatumForm() {
    return html`
      <div>
        <h2>Record your gas datas</h2>
        <label>Total mileage (miles, read odometer): <input ${ref(this.carMileageRef)} name="carMileage"
                                                            type="text"></label><br>
        <label>Gas purchased (gallons): <input ${ref(this.gasAmountRef)} name="gasAmount" type="text"></label><br>
        <label>Gas total cost (dollars): <input ${ref(this.gasCostRef)} name="gasCost" type="text"></label><br>
        <label><input @click=${this.submitGasDatum} type="submit"></label>
      </div>
      <hr>
    `;
  }

  private getDataVis() {
    return html`
      <gas-data-analytics-dashboard></gas-data-analytics-dashboard>
      <hr>
    `;
  }

  private getGasDataControlPanel() {
    return html`
      <div>
        <button @click="${() => this.showAddRecordForm = !this.showAddRecordForm}">
          ${this.showAddRecordForm ? 'Hide' : 'Show'} Add Record Form
        </button>
        <button @click="${() => this.showDashboard = !this.showDashboard}">
          ${this.showDashboard ? 'Hide' : 'Show'} Data Analytics
        </button>
        <button @click="${this.downloadGasData}">
          Save your data
        </button>
        <button @click="${this.importGasData}">
          Import your data
        </button>
      </div>
      <hr>
    `;
  }

  private getPersistenceWarning() {
    const { storage } = navigator;
    let persistenceMessage = '';

    if (!(storage && storage.persist)) {
      persistenceMessage = `Storage Persistence not available in this browser.`;
    }

    if (this.storagePersisted) {
      persistenceMessage = `Storage for this app is persisted. Yay.`;
    }

    if (!this.storagePersisted) {
      persistenceMessage = `Storage for this app is not persisted. Requesting persistence permissions.`;
    }

    return html`
      <div>
        ${persistenceMessage}
      </div>
    `;
  }
}

customElements.define('gas-data-dashboard', GasDataApp);
