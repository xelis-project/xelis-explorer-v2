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

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 5)
            .attr('d', line);

        /*svg.append("g")
            .call(d3.axisLeft(y_scale).tickFormat(function (d) {
                return format_hashrate(d as number, info.block_time_target);
            })
                .ticks(10));*/

        svg.selectAll(`circle`)
            .data(data)
            .join(`circle`)
            .attr('cx', d => x_scale(d.x))
            .attr('cy', d => y_scale(d.y))
            .attr('r', 5)
            .attr('fill', 'white')
            .attr('stroke', 'none');

        const min_data = data.reduce((a, b) => (a.y < b.y ? a : b));

        svg
            .append(`text`)
            .attr("x", x_scale(min_data.x))
            .attr("y", y_scale(min_data.y))
            .text(format_hashrate(min_data.y, info.block_time_target))
            .style('font-size', '1rem')
            .style("text-anchor", "middle")
            .style('font-weight', `bold`)
            .style('fill', 'white');

        const max_data = data.reduce((a, b) => (a.y > b.y ? a : b));

        svg
            .append(`text`)
            .attr("x", x_scale(max_data.x))
            .attr("y", y_scale(max_data.y))
            .text(format_hashrate(max_data.y, info.block_time_target))
            .style('font-size', '1rem')
            .style("text-anchor", "middle")
            .style('font-weight', `bold`)
            .style('fill', 'white');
    }

    update() {
        const { info, blocks } = DashboardPage.instance().page_data;
        if (info) {
            this.set_hashrate(info);
            this.build_chart(blocks, info);
        }
    }
}