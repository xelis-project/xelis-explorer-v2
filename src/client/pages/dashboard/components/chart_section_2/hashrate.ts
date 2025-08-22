import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Block } from '@xelis/sdk/daemon/types';

interface DataPoint {
    x: number;
    y: number;
}

export class DashboardHashRate {
    box_chart: BoxChart;
    blocks: Block[];

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `HASHRATE`;
        this.box_chart.element_value.innerHTML = `5.5Gh/s`;
        this.blocks = [];

        window.addEventListener(`resize`, () => {
            this.build_chart();
        });
    }

    build_chart() {
        const data = this.blocks.map((block) => {
            return { x: block.height, y: parseInt(block.difficulty) };
        });

        const rect = this.box_chart.box.element.getBoundingClientRect();
        const width = rect.width;
        const height = 150;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", `100%`)
            .attr("height", `5rem`)
            .append("g")

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x) as [number, number])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)!])
            .nice()
            .range([height, 0]);

        const line = d3.line<DataPoint>()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 5)
            .attr('d', line);
    }

    load(blocks: Block[]) {
        this.blocks = blocks;
        this.build_chart();
    }
}