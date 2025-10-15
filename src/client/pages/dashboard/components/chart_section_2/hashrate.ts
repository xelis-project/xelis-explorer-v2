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

    blocks: Block[];
    info!: GetInfoResult;
    chart?: {
        node: d3.Selection<SVGGElement, unknown, null, undefined>;
        width: number;
        height: number;
        rect: DOMRect
    }

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `HASHRATE`;
        this.blocks = [];

        window.addEventListener(`resize`, () => {
            this.create_chart();
            this.update_chart();
        });
    }

    set_hashrate(info: GetInfoResult) {
        const hashrate = format_hashrate(parseInt(info.difficulty), info.block_time_target);
        this.box_chart.element_value.innerHTML = hashrate;
    }

    create_chart() {
        this.box_chart.element_content.replaceChildren();

        const margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const node = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        this.chart = { node, width, height, rect };
    }

    update_chart() {
        if (!this.chart) return;

        const data = this.blocks
            .filter((item, i) => this.blocks.map(x => x.height).indexOf(item.height) === i) // no duplicate height - remove side block
            .map((block) => {
                return { x: block.height, y: parseInt(block.difficulty) };
            }) as DataPoint[];

        const x_scale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x) as [number, number])
            .range([0, this.chart.width]);

        const y_scale = d3.scaleLinear()
            .domain([d3.min(data, d => d.y)!, d3.max(data, d => d.y)!])
            .nice()
            .range([this.chart.height, 0]);

        const line = d3.line<DataPoint>()
            .x(d => x_scale(d.x))
            .y(d => y_scale(d.y))
            .curve(d3.curveMonotoneX);

        const min_data = data.reduce((a, b) => (a.y < b.y ? a : b), data[0] ? data[0] : { x: 0, y: 0 });
        const max_data = data.reduce((a, b) => (a.y > b.y ? a : b), data[0] ? data[0] : { x: 0, y: 0 });
        const defs = this.chart.node.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "grad_y")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("x2", 0)
            .attr("y1", y_scale(min_data.y))
            .attr("y2", y_scale(max_data.y));

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#02ffcf");
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ff00aa");

        const path = this.chart.node
            .selectAll(`path`)
            .data([data])
            .attr('d', (d) => line(d))

        path.enter()
            .append('path')
            .attr('fill', `none`)
            .style('stroke-width', 5)
            .attr('stroke', `url(#grad_y)`)
            .attr('d', (d) => line(d));

        path.exit().remove();

        /* 
        this.chart.node
            .selectAll(`circle`)
            .data(data)
            .join(`circle`)
            .attr('cx', d => x_scale(d.x))
            .attr('cy', d => y_scale(d.y))
            .attr('r', 5)
            .attr('stroke', 'none')
            .attr('fill', d => color(d.y));
        */

        // update tooltip
        const chart_rect_width = this.chart.rect.width;
        this.chart.node
            .selectAll(`.tooltip`)
            .remove();

        const tooltip = this.chart.node
            .selectAll(`.tooltip`)
            .data<DataPoint>([min_data, max_data])
            .enter()
            .append(`g`)
            .attr(`class`, `tooltip`);

        tooltip
            .append(`text`)
            .text(d => format_hashrate(d.y, this.info.block_time_target))
            .each(function (d) {
                const self = this as SVGTextElement;

                const text_box = self.getBBox();
                const rect_margin = { top: 2, left: 10, bottom: 2, right: 10 };
                const rect_width = text_box.width + rect_margin.left + rect_margin.right;
                const rect_height = text_box.height + rect_margin.top + rect_margin.bottom;

                const text_pos = { x: 0, y: 0 };
                text_pos.x = Math.min(chart_rect_width - rect_width - 10, Math.max(0, x_scale(d.x) - text_box.width / 2));
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
            .style('fill', 'rgba(2, 255, 209)');
    }

    set(info: GetInfoResult, blocks: Block[]) {
        this.info = info;
        this.blocks = blocks;

        this.set_hashrate(info);

        if (!this.chart) {
            this.create_chart();
        }

        this.update_chart();
    }
}