import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';

export class DashboardDailyTxs {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `DAILY TRANSACTIONS`;
        this.box_chart.element_value.innerHTML = `2K`;
        this.box_chart.element_sub_value.innerHTML = `+10.5%`;

        // Data interface
        interface DataPoint {
            x: number;
            y: number;
        }

        // Sample data
        const data: DataPoint[] = [
            { x: 0, y: 5 },
            { x: 1, y: 9 },
            { x: 2, y: 7 },
            { x: 3, y: 5 },
            { x: 4, y: 3 },
            { x: 5, y: 7 },
            { x: 6, y: 11 }
        ];

        // Chart dimensions and margins
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const width = 250 - margin.left - margin.right;
        const height = 150 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3
            .select(this.box_chart.element_content)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

            /*
                   .append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
            .attr('preserveAspectRatio', 'xMinYMin')
            .append("g")
            */

        // Create scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x) as [number, number])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)!])
            .nice()
            .range([height, 0]);

        // Add axes
        //svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
        //svg.append("g").call(d3.axisLeft(y));


        // Line generator
        const line = d3.line<DataPoint>()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        // Add the line path
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 5)
            .attr('d', line);
    }
}