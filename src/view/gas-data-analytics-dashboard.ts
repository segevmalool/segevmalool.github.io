import { svg, html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import type { Subscription } from 'rxjs';
import * as d3 from 'd3';

import type { GasDataResponse, GasDataMilesPerGallon, GasDatum } from '../types/gas-data.types';
import { GasDataPersistence } from '../persistence/gas-data-persistence';

export class GasDataAnalyticsDashboard extends LitElement {
  private gasDataSubscription?: Subscription;

  @state()
  private gasDataForMilesPerGallon?: GasDataMilesPerGallon[];

  public async connectedCallback() {
    super.connectedCallback();
    await this.subscribeGasData();
  }

  public async disconnectedCallback() {
    super.disconnectedCallback();
    this.gasDataSubscription?.unsubscribe();
  }

  gasMileagePlot() {
    const height = 400;
    const width = 600;
    const marginTop = 40;
    const marginBottom = 40;
    const marginLeft = 40;
    const marginRight = 40;

    const d3Svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'myelement')
    .style('border', '1px solid black')
    .attr('overflow', 'visible');

    if (!this.gasDataForMilesPerGallon || this.gasDataForMilesPerGallon.length < 2) {
      return 'Please collect more data';
    }

    // Create the scales
    const startTime = this.gasDataForMilesPerGallon[0].endDateTimestamp;
    const endTime = this.gasDataForMilesPerGallon[this.gasDataForMilesPerGallon.length-1].endDateTimestamp;

    const xScale = d3.scaleUtc()
      .domain([new Date(startTime), new Date(endTime)])
      .range([marginLeft, width - marginRight]);

    const yScale = d3.scaleLinear()
      .domain([0,100])
      .range([height - marginBottom, marginTop]);


    // Append the axes
    d3Svg.append('g').attr('transform', `translate (0, ${height - marginBottom})`).call(d3.axisBottom(xScale));
    d3Svg.append('g').attr('transform', `translate (${marginLeft}, 0)`).call(d3.axisLeft(yScale));

    // Append the points
    const pointsGroup = d3Svg.append('g').attr('id', 'pointsGroup');

    pointsGroup.selectAll('g')
    .data(this.gasDataForMilesPerGallon)
    .enter().append('circle')
    .attr('r', 5)
    .attr('cx', (datum) => xScale(new Date(datum.endDateTimestamp)))
    .attr('cy', (datum) => yScale(datum.mpg));

    // Append lines connecting the points
    const scatterPlotLine = d3.line<GasDataMilesPerGallon>()
    .x((datum) => xScale(new Date(datum.endDateTimestamp)))
    .y((datum) => yScale(datum.mpg));

    d3Svg.append('path').attr('d', scatterPlotLine(this.gasDataForMilesPerGallon))
    .attr('stroke', 'blue')
    .attr('fill', 'none');

    // Append the title
    d3Svg.append('text')
    .attr('x', width/2)
    .attr('y', marginTop + 10)
    .attr('text-anchor', 'middle')
    .text('Your Car\'s Fuel Efficiency');

    // y label
    d3Svg.append('text')
    .attr('x', marginLeft + 30)
    .attr('y', marginTop)
    .attr('text-anchor', 'middle')
    .text('MPG');

    // x label
    d3Svg.append('text')
    .attr('x', width - marginRight - 20)
    .attr('y', height - marginBottom - 15)
    .attr('text-anchor', 'middle')
    .text('Date');

    return svg`${d3Svg.node()}`;
  }

  public render() {
    return html`
      <div>
        <h2>Gas Data Analytics Dashboard</h2>
        ${this.gasMileagePlot()}
      </div>
    `;
  }

  private transformGasDataForMpg(gasData: GasDatum[]): GasDataMilesPerGallon[] {
    const gasDataForMpg: GasDataMilesPerGallon[] = [];

    if (gasData.length <= 0) {
      return gasDataForMpg;
    }

    for (let i = 1; i < gasData.length; i += 1) {
      gasDataForMpg[i-1] = {
        endDateTimestamp: gasData[i].timeStamp,
        mpg: (gasData[i].carMileage - gasData[i-1].carMileage)/gasData[i].gasAmount
      };
    }

    return gasDataForMpg;
  }

  private async subscribeGasData() {
    this.gasDataSubscription = GasDataPersistence.getInstance().getGasData$.subscribe((gasDataObservation: GasDataResponse) => {
      if (!gasDataObservation.gasData) {
        throw new Error('received empty gas data')
      }

      const gasDataForAnalytics = this.transformGasDataForMpg(gasDataObservation.gasData);

      this.gasDataForMilesPerGallon = gasDataForAnalytics;
    });
  }

}

customElements.define('gas-data-analytics-dashboard', GasDataAnalyticsDashboard);
