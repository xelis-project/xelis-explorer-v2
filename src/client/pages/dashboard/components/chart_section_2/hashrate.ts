import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Block, GetInfoResult } from '@xelis/sdk/daemon/types';
import { format_hashrate } from '../../../../utils/format_hashrate';
import { DashboardPage } from '../../dashboards';

interface DataPoint {
    x: number;
    y: number;
    box?: DOMRect;
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

    build_chart(blocks: Block[], info: GetInfoResult) {
        const data = blocks
            //.filter((item, i) => blocks.indexOf(item) === i)
            .map((block) => {
                return { x: block.height, y: parseInt(block.difficulty) };
            });

        const margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const x_scale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x) as [number, number])
            .range([0, width]);

        const y_scale = d3.scaleLinear()
            .domain([d3.min(data, d => d.y)!, d3.max(data, d => d.y)!])
            .nice()
            .range([height, 0]);

        const line = d3.line<DataPoint>()
            .x(d => x_scale(d.x))
            .y(d => y_scale(d.y))
            .curve(d3.curveMonotoneX);

        const color = d3.scaleLinear<string>()
            .domain(data.map(d => d.y))
            .range(d3.quantize(t => d3.interpolateRgb(`#02ffcf`, `#ff00aa`)(t * 0.5), data.length));

        svg
            .append('path')
            .datum(data)
            .attr('fill', `none`)
            .attr('stroke', d => `rgba(2, 255, 209, 0.3)`)
            //.attr('stroke', d => color(d.y))
            .attr('stroke-width', 5)
            .attr('d', line);

        svg
            .selectAll(`circle`)
            .data(data)
            .join(`circle`)
            .attr('cx', d => x_scale(d.x))
            .attr('cy', d => y_scale(d.y))
            .attr('r', 5)
            .attr('fill', d => color(d.y))
            .attr('stroke', 'none');

        const min_data = data.reduce((a, b) => (a.y < b.y ? a : b));
        const max_data = data.reduce((a, b) => (a.y > b.y ? a : b));

        const text = svg
            .selectAll(`g`)
            .data<DataPoint>([min_data, max_data])
            .enter()
            .append(`g`);

        text
            .append(`text`)
            .attr("x", d => x_scale(d.x))
            .attr("y", d => y_scale(d.y))
            .text(d => format_hashrate(d.y, info.block_time_target))
            .each(function (d) {
                const self = this as SVGTextElement;
                const box = self.getBBox();
                const margin = { top: 2, left: 10, bot: 2, right: 10 };
                box.x = box.x - box.width / 2 - margin.left;
                box.y = box.y - margin.top;
                box.width = box.width + margin.left + margin.right;
                box.height = box.height + margin.top + margin.bot;

                d.box = box;
            })
            .style('font-size', '1rem')
            .style("text-anchor", "middle")
            .style('font-weight', `bold`)
            .style('fill', 'rgba(0, 0, 0, 1)');

        text.insert(`rect`, ":first-child")
            .attr("x", d => d.box ? d.box.x : 0)
            .attr("y", d => d.box ? d.box.y : 0)
            .attr("width", d => d.box ? d.box.width : 0)
            .attr("height", d => d.box ? d.box.height : 0)
            .style('fill', 'rgba(2, 255, 209, 0.8)');
    }

    set(info: GetInfoResult, blocks: Block[]) {
        this.set_hashrate(info);
        this.build_chart(blocks, info);
    }
}