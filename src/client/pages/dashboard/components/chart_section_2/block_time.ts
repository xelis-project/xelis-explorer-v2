import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Block } from '@xelis/sdk/daemon/types';
import { DashboardPage } from '../../dashboards';
import prettyMilliseconds from 'pretty-ms';

export class DashboardBlockTime {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `BLOCK TIME`;
    }

    set_avg_time(avg_time: number) {
        this.box_chart.element_value.innerHTML = `${prettyMilliseconds(avg_time, { compact: true })} avg`;
    }

    build_chart(blocks: Block[]) {
        const margin = { top: 10, right: 0, bottom: 10, left: 30 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 150 - margin.top - margin.bottom;

        const data = [];
        for (let i = 0; i < blocks.length; i++) {
            const prev_block = blocks[i - 1];
            const block = blocks[i];
            if (prev_block) {
                const time_ms = block.timestamp - prev_block.timestamp;
                if (prev_block.height === block.height) continue;
                data.push({ x: block.height, y: time_ms });
            }
        }

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x_scale = d3
            .scaleBand<number>()
            .domain(data.map((d) => d.x))
            .range([0, width])
            .padding(0.2);

        const y_scale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.y)!])
            .range([height, 0]);

        svg
            .selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => x_scale(d.x)!)
            .attr("y", (d) => y_scale(d.y))
            .attr("rx", 3)
            .attr("width", x_scale.bandwidth())
            .attr("height", (d) => height - y_scale(d.y))
            .attr("fill", "white");

        svg.append("g")
            .call(d3.axisLeft(y_scale).tickFormat(function (d) {
                return prettyMilliseconds(d as number, { colonNotation: true });
            })
                .ticks(10));
    }

    update() {
        const { info, blocks } = DashboardPage.instance().page_data;
        if (info) this.set_avg_time(info.average_block_time);
        this.build_chart(blocks);
    }
}