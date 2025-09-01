import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { TxBlock } from '../../../../components/tx_item/tx_item';
import { Block } from '@xelis/sdk/daemon/types';

export class MempoolChartBlocksTxs {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `PAST BLOCKS`;
    }

    build_chart(blocks: Block[]) {
        const margin = { top: 20, right: 0, bottom: 20, left: 0 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 150 - margin.top - margin.bottom;

        const data = blocks.map((b, i) => {
            return { label: blocks.length - i, value: b.txs_hashes.length };
        });

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x_scale = d3
            .scaleBand<string>()
            .domain(data.map((d) => d.label))
            .range([0, width])
            .padding(0.2);

        const y_scale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)!])
            .range([height, 0]);

        const color = d3.scaleLinear<string>()
            .domain(data.map(d => d.value))
            .range(d3.quantize(t => d3.interpolateRgb(`#02ffcf`, `#ff00aa`)(t * 0.5), data.length));

        svg
            .selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => x_scale(d.label)!)
            .attr("y", (d) => y_scale(d.value))
            .attr("rx", 3)
            .attr("width", x_scale.bandwidth())
            .attr("height", (d) => height - y_scale(d.value))
            .attr("fill", d => color(d.value));

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x_scale));

        svg
            .selectAll()
            .data(data)
            .enter()
            .append('text')
            .attr('transform', d => `translate(${x_scale(d.label)! + x_scale.bandwidth() / 2}, ${y_scale(d.value) - 5})`)
            .text(d => `${d.value}`)
            .style('font-size', '1rem')
            .style("text-anchor", "middle")
            .style('font-weight', `bold`)
            .style('fill', 'white');
    }
}