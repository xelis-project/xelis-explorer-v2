import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';

export class DashboardBlockTime {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `BLOCK TIME`;
        this.box_chart.element_value.innerHTML = `15s avg`;

        // Data interface
        interface DataPoint {
            name: string;
            value: number;
        }

        // Sample data
        const data: DataPoint[] = [
            { name: "1", value: 10 },
            { name: "2", value: 25 },
            { name: "3", value: 15 },
            { name: "4", value: 30 },
            { name: "5", value: 25 },
            { name: "6", value: 15 },
            { name: "7", value: 30 },
            { name: "8", value: 25 },
            { name: "9", value: 15 },
            { name: "10", value: 30 },
            { name: "11", value: 25 },
            { name: "12", value: 15 },
            { name: "13", value: 30 },
            { name: "14", value: 25 },
            { name: "15", value: 15 },
            { name: "16", value: 30 },
            { name: "17", value: 25 },
            { name: "18", value: 15 },
            { name: "19", value: 30 },
            { name: "20", value: 25 },
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
        const x = d3
            .scaleBand<string>()
            .domain(data.map((d) => d.name))
            .range([0, width])
            .padding(0.1);

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)!])
            .range([height, 0]);

        // Add axes
        //svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
        //svg.append("g").call(d3.axisLeft(y));


        // Add the line path
        svg
            .selectAll(".bar")
            .data(data)
            .join("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.name)!)
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.value))
            .attr("fill", "white");
    }
}