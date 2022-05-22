import {html, css, svg, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

@customElement('dynamic-lr')
export class DynamicLr extends LitElement {
    @state() data: number[][];
    @state() showMeans: boolean;
    @state() showResiduals: boolean;
    @state() showRegressionLine: boolean;

    n: number;
    meanX: number;
    meanY: number;
    varX: number;
    covXY: number;
    y0: number; // intercept estimate
    m: number; // slope estimate

    static styles = css`
        svg {
          border: 1px solid black;
          height: 100%;
          width: 100%;
        }
    `;

    constructor() {
        super();
        this.data = [];
        this.n = 0;
        this.meanX = 0;
        this.meanY = 0;
        this.varX = 0;
        this.covXY = 0;
        this.y0 = 0;
        this.m = 0;

        this.showMeans = true;
        this.showResiduals = true;
        this.showRegressionLine = true;
    }

    addPoint(event: PointerEvent) {
        const x = event.clientX - (event.target as SVGElement).getBoundingClientRect().left;
        const y = event.clientY - (event.target as SVGElement).getBoundingClientRect().top;

        this.meanX = (this.n / (this.n + 1)) * this.meanX + (1 / (this.n + 1)) * x;
        this.meanY = (this.n / (this.n + 1)) * this.meanY + (1 / (this.n + 1)) * y;

        this.varX = (this.n / (this.n + 1)) * this.varX + (1 / (this.n + 1)) * ((x - this.meanX) ** 2)
        this.covXY = (this.n / (this.n + 1)) * this.covXY + (1 / (this.n + 1)) * ((x - this.meanX) * (y - this.meanY))

        this.m = this.covXY / this.varX;
        this.y0 = this.meanY - this.m * this.meanX;

        this.data = [...this.data, [x, y]];
        this.n += 1;
    }

    getSvgPoints() {
        return this.data.map(point => svg`
            <circle cx="${point[0]}" cy="${point[1]}" r="5" fill="black"></circle>
        `);
    }

    getSvgMeanLines(endpoint: number) {
        return svg`
            <line x1="${this.meanX}" y1="0" x2="${this.meanX}" y2="${endpoint}" stroke="blue"></line>
            <line x1="0" y1="${this.meanY}" x2="${endpoint}" y2="${this.meanY}" stroke="blue"></line>
        `;
    }

    getSvgRegressionLine(endpoint: number) {
        return svg`<line x1="0" y1="${this.y0}" x2="${endpoint}" y2="${this.y0 + this.m * endpoint}" stroke="black"></line>`;
    }

    getSvgResidualLines() {
        return this.data.map(point => svg`
            <line x1="${point[0]}" y1="${point[1]}" x2="${point[0]}" y2="${this.y0 + this.m * point[0]}" stroke="red" ></line>
        `);
    }

    logStats() {
        console.table(this.data);
        console.log("means (x,y): ", this.meanX, this.meanY);
        console.log("vars (x): ", this.varX, this.covXY);
        console.log("line params: ", this.y0, this.m);
    }

    lrFromData() {
        const meanX = this.sum(this.data.map(point => point[0])) / this.data.length;
        const meanY = this.sum(this.data.map(point => point[1])) / this.data.length;

        const covXY = this.dot(
            this.data.map(point => point[0] - meanX),
            this.data.map(point => point[1] - meanY)
        );
        const varX = this.sum(this.data.map(point => (point[0] - meanX) ** 2));

        const m = covXY / varX;
        const y0 = meanY - meanX * m;

        return [m, y0];
    }

    sum(x: number[]) {
        let sum = 0;
        for (let i = 0; i < x.length; i += 1) {
            sum += x[i];
        }
        return sum;
    }

    dot(x: number[], y: number[]) {
        let dot = 0;
        for (let i = 0; i < x.length; i += 1) {
            dot += x[i] * y[i];
        }
        return dot;
    }

    render() {
        const max = 3000;
        //this.logStats();
        //const [m,y0] = this.lrFromData();
        console.log("rerender")
        return html`
            <h1>Real Time Machine Learning</h1>
            <hr>
            <h2>Control Panel</h2>
            <button @click="${() => this.showMeans = !this.showMeans}">Toggle Means</button>
            <button @click="${() => this.showResiduals = !this.showResiduals}">Toggle Residuals</button>
            <button @click="${() => this.showRegressionLine = !this.showRegressionLine}">Toggle Regression Line</button>
            <hr>
            <svg @click="${this.addPoint}">
                ${this.getSvgPoints()}
                ${this.showRegressionLine ? this.getSvgRegressionLine(max) : null}
                ${this.showMeans ? this.getSvgMeanLines(max) : null}
                ${this.showResiduals ? this.getSvgResidualLines() : null}
            </svg>
        `;
    }
}

export { TfjsModel } from './tfjsModel';
