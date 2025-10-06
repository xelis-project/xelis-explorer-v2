import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { PeerLocation } from '../../../../components/peers_map/peers_map';

export class PeersChartNodesByCountry {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `NODES BY COUNTY`;
    }

    build_chart(peers_locations: PeerLocation[]) {
        const margin = { top: 20, right: 0, bottom: 20, left: 0 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 150 - margin.top - margin.bottom;

        const peers_country = {} as Record<string, number>;

        peers_locations.forEach((peer_location) => {
            const { geo_location } = peer_location;
            let country = geo_location.country || `Unknown`;

            if (peers_country[country]) {
                peers_country[country]++;
            } else {
                peers_country[country] = 1;
            }
        });

        let data = Object.keys(peers_country).map((key) => {
            return { label: key, value: peers_country[key] };
        })

        data = data.sort((a, b) => b.value - a.value).slice(0, 10);

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
            .range(data.length > 1 ? d3.quantize(t => d3.interpolateRgb(`#02ffcf`, `#ff00aa`)(t * 0.5), data.length) : [`#02ffcf`]);

        svg
            .selectAll()
            .data(data)
            .join("rect")
            .attr("x", (d) => x_scale(d.label)!)
            .attr("y", (d) => y_scale(d.value))
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