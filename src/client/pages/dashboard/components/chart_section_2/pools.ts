import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { DashboardPage } from '../../dashboards';
import { format_address } from '../../../../utils/format_address';
import { Block } from '@xelis/sdk/daemon/types';

interface DataItem {
    label: string;
    value: number;
}

export class DashboardPools {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `POOLS & MINERS`;
    }

    set_miner_count(count: number) {
        this.box_chart.element_value.innerHTML = `${count.toLocaleString()}`;
    }

    build_chart(miners: Record<string, number>) {
        let data = Object.keys(miners).map((miner, i) => {
            return {
                label: format_address(miner),
                value: miners[miner],
            };
        });

        data = data.sort((a, b) => b.value - a.value).slice(0, 6);

        const width = 150;
        const height = 150;
        const radius = Math.min(width, height) / 2;

        const donutInnerOffset = 25;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append('svg')
            .attr('width', `100%`)
            .attr('height', height)
            .append('g')

            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const pieGenerator = d3.pie<DataItem>()
            .value(d => d.value)
            .sort(null);

        const arcData = pieGenerator(data);

        const arcGenerator = d3.arc<d3.PieArcDatum<DataItem>>()
            .innerRadius(radius - donutInnerOffset)
            .outerRadius(radius);

        const color = d3.scaleOrdinal<string>()
            .domain(data.map(d => d.label))
            .range(data.length > 1 ? d3.quantize(t => d3.interpolateRgb(`#02ffcf`, `#ff00aa`)(t * 0.5), data.length) : [`#02ffcf`]);

        const arcs = svg.selectAll('path')
            .data(arcData)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', d => color(d.data.label));

        const legend_radius = 8;
        const legend_spacing = 15;

        const legend = svg
            .selectAll('.legend')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => {
                var height = legend_radius + legend_spacing;
                var offset = height * color.domain().length / 2;
                var x = 100;
                var y = (i * height) - offset;
                return `translate(${x}, ${y})`;
            });

        legend
            .append('circle')
            .attr('r', legend_radius)
            .style('fill', d => color(d.label));

        legend
            .append('text')
            .attr('x', 5 + legend_radius)
            .attr('y', legend_radius / 2)
            .style(`fill`, d => color(d.label))
            .text((d) => `${d.label} (${d.value})`);
    }

    set(blocks: Block[]) {
        const miners = {} as Record<string, number>;

        for (let i = 0; i < blocks.length; i++) {
            const { miner } = blocks[i];
            if (miners[miner]) {
                miners[miner] += 1;
            } else {
                miners[miner] = 1;
            }
        }

        this.set_miner_count(Object.keys(miners).length);
        this.build_chart(miners);
    }
}