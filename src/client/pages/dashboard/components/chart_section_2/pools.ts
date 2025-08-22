import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';

export class DashboardPools {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `POOLS & MINERS`;
        this.box_chart.element_value.innerHTML = `7`;

        // Data interface
        interface DataItem {
            label: string;
            value: number;
            color: string;
        }

        const data: DataItem[] = [
            { label: 'A', value: 30, color: `#02FFCF` },
            { label: 'B', value: 70, color: `#1B705F` },
            { label: 'C', value: 45, color: `#6DB5A7` },
            { label: 'D', value: 55, color: `#BFF0E7` }
        ];

        // Chart dimensions and margins
        const width = 150;
        const height = 150;
        const radius = Math.min(width, height) / 2;

        const donutInnerOffset = 25;

        // Create SVG container
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

        const color = d3.scaleOrdinal<string>()
            .domain(data.map(d => d.label))
            .range(d3.schemeCategory10);

        const arcs = svg.selectAll('path')
            .data(arcData)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('fill', d => d.data.color)
            //.attr('stroke', 'white')
            //.attr('stroke-width', 2);
    }
}