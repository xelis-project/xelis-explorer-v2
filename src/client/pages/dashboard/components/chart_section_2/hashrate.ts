import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Block, GetInfoResult } from '@xelis/sdk/daemon/types';
import { format_hashrate } from '../../../../utils/format_hashrate';

interface DataPoint {
    x: number;
    y: number;
    text?: { x: number; y: number; }
    text_rect?: DOMRect;
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
            .filter((item, i) => blocks.map(x => x.height).indexOf(item.height) === i) // no duplicate height - remove side block
            .map((block) => {
                return { x: block.height, y: parseInt(block.difficulty) };
            });

        const chart_margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const chart_rect = this.box_chart.element_content.getBoundingClientRect();
        const width = chart_rect.width - chart_margin.left - chart_margin.right;
        const height = 250 - chart_margin.top - chart_margin.bottom;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + chart_margin.left + chart_margin.right)
            .attr("height", height + chart_margin.top + chart_margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + chart_margin.left + "," + chart_margin.top + ")");

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

        const tooltip = svg
            .selectAll(`g`)
            .data<DataPoint>([min_data, max_data])
            .enter()
            .append(`g`);

        tooltip
            .append(`text`)
            .text(d => format_hashrate(d.y, info.block_time_target))
            .each(function (d) {
                const self = this as SVGTextElement;

                const text_box = self.getBBox();
                const rect_margin = { top: 2, left: 10, bottom: 2, right: 10 };
                const rect_width = text_box.width + rect_margin.left + rect_margin.right;
                const rect_height = text_box.height + rect_margin.top + rect_margin.bottom;

                const text_pos = { x: 0, y: 0 };
                text_pos.x = Math.min(chart_rect.width - rect_width, Math.max(0, x_scale(d.x) - text_box.width / 2));
                text_pos.y = Math.max(rect_height / 2, y_scale(d.y));
                d.text = text_pos;

                const text_rect = {} as DOMRect;
                text_rect.x = text_pos.x - rect_margin.left + 2;
                text_rect.y = text_pos.y - (rect_height / 2) - 5;
                text_rect.width = rect_width;
                text_rect.height = rect_height;

                d.text_rect = text_rect;
            })
            .attr("x", d => {
                return d.text ? d.text.x : 0;
            })
            .attr("y", d => {
                return d.text ? d.text.y : 0;
            })
            .style('font-size', '1rem')
            //.style("text-anchor", "middle") // using js to anchor text in the middle to bound text within the canvas
            .style('font-weight', `bold`)
            .style('fill', 'rgba(0, 0, 0, 1)');

        tooltip.insert(`rect`, ":first-child")
            .attr("x", d => d.text_rect ? d.text_rect.x : 0)
            .attr("y", d => d.text_rect ? d.text_rect.y : 0)
            .attr("width", d => d.text_rect ? d.text_rect.width : 0)
            .attr("height", d => d.text_rect ? d.text_rect.height : 0)
            .style('fill', 'rgba(2, 255, 209, 0.8)');
    }

    set(info: GetInfoResult, blocks: Block[]) {
        this.set_hashrate(info);
        this.build_chart(blocks, info);
    }
}