import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { DashboardPage } from '../../dashboards';
import { format_address } from '../../../../utils/format_address';

/*
const colors = [
    "#7ffff0", "#40ffe8", "#1affdf", "#02ffcf", "#02bfa1", "#028f73", "#016e55",
    "#86d8c9", "#5fbfaf", "#3fab9f", "#1b705f", "#16584b", "#113f38", "#0c2c28",
    "#cff5ef", "#a3e5d8", "#8ed5c9", "#6db5a7", "#558f84", "#3c6a60", "#284a42",
    "#ffffff", "#e7fafa", "#d0f4ef", "#bff0e7", "#99cbb8", "#73978a", "#4c6560"
];
*/

interface DataItem {
    label: string;
    value: number;
    //color: string;
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
        const data = Object.keys(miners).map((miner, i) => {
            return {
                label: format_address(miner),
                value: miners[miner],
                //color: colors[i] || `white`
            };
        });

        const width = 150;
        const height = 150;
        const radius = Math.min(width, height) / 2;

        const donutInnerOffset = 25;

        this.box_chart.element_content.replaceChildren();
        const svg = d3
            .select(this.box_chart.element_content)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const pieGenerator = d3.pie<DataItem>()
            .value(d => d.value)
            .sort(null);

        const arcData = pieGenerator(data);

        const arcGenerator = d3.arc<d3.PieArcDatum<DataItem>>()
            .innerRadius(radius - donutInnerOffset)  // Creates the hole
            .outerRadius(radius);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.label))
            .range(d3.quantize(t => d3.interpolateRgb(`#02ffcf`, `#ff00aa`)(t * 0.5), data.length));

        //const color = d3.scaleOrdinal<string>()
        //.domain(data.map(d => d.label))
        //.range(d3.schemeCategory10);

        const arcs = svg.selectAll('path')
            .data(arcData)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', d => color(d.data.label));
    }

    update() {
        const { blocks } = DashboardPage.instance().page_data;
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