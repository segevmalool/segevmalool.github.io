import { html, svg, css, LitElement } from 'lit';
import { customElement, state } from "lit/decorators.js";
import {layers, LayersModel, input, model, SymbolicTensor} from '@tensorflow/tfjs';

@customElement('tfjs-model')
export class TfjsModel extends LitElement {
    @state() showRegressionCurve: boolean;
    @state() data: number[][];
    model?: LayersModel;
    threshold: number = 2;

    constructor() {
        super();
        this.showRegressionCurve = true;
        this.data = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.initializeModel();
    }

    initializeModel() {
        const inputs = input({shape: [2]});
        const layer1 = layers.dense({units: 2});
        const squash = layers.leakyReLU();

        const outputs = squash.apply(layer1.apply(inputs)) as SymbolicTensor;
        this.model = model({inputs, outputs});
    };

    addPoint(event: PointerEvent) {
        const x1 = event.clientX - (event.target as SVGElement).getBoundingClientRect().left;
        const x2 = event.clientY - (event.target as SVGElement).getBoundingClientRect().top;

        this.data = [...this.data, [x1, x2]]
    }

    getSvgPoints() {
        return this.data.map(point => svg`
            <circle cx="${point[0]}" cy="${point[1]}" r="5" fill="black"></circle>
        `);
    }

    getSvgRegressionCurve() {
        return this.data.map(point => svg`
            <circle cx="${point[0]}" cy="${point[1]}" r="5" fill="black"></circle>
        `);
    }

    render() {
        const max = 3000;

        return html`
            <h1>Real Time Machine Learning</h1>
            <hr>
            <h2>Control Panel</h2>
            <button @click="${() => this.showRegressionCurve = !this.showRegressionCurve}">Toggle Regression Line</button>
            <hr>
            <svg @click="${this.addPoint}">
                ${this.getSvgPoints()}
                ${this.showRegressionCurve ? this.getSvgRegressionCurve() : null}
            </svg>
        `;
    }
}