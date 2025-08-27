import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Block, GetInfoResult } from '@xelis/sdk/daemon/types';
import { format_hashrate } from '../../../../utils/format_hashrate';
import { DashboardPage } from '../../dashboards';

interface DataPoint {
    x: number;
    y: number;
}

export class DashboardHashRate {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `HASHRATE`;

        window.addEventListener(`resize`, () => {
            //this.build_chart();
        });
    }

    set_hashrate(info: GetInfoResult) {
        const hashrate = format_hashrate(parseInt(info.difficulty), info.block_time_target);
        this.box_chart.element_value.innerHTML = hashrate;
    }

    build_chart(blocks: Block[]) {
        const data = blocks
            //.filter((item, i) => blocks.indexOf(item) === i)
            .map((block) => {
                return { x: block.height, y: parseInt(block.difficulty) };
            });

        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width;
        const height = 300;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", `100%`)
            .attr("height", `100%`)
            .append("g");

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

        svg.selectAll(`circle`)
            .data(data)
            .join(`circle`)
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 6)
            .attr('fill', 'white')
            .attr('stroke', 'none');
    }

    update() {
        const { info, blocks } = DashboardPage.instance().page_data;
        if (info) this.set_hashrate(info);
        this.build_chart(blocks);
    }
}