import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { Peer } from '@xelis/sdk/daemon/types';

interface DataItem {
    label: string;
    value: number;
}

export class PeersChartNodesByVersion {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `NODES BY VERSION`;
    }

    build_chart(peers: Peer[]) {
        const peers_version = {} as Record<string, number>;

        peers.forEach((peer, i) => {
            if (peers_version[peer.version]) {
                peers_version[peer.version]++;
            } else {
                peers_version[peer.version] = 1;
            }
        });

        let data = Object.keys(peers_version).map((key) => {
            return { label: key, value: peers_version[key] };
        });

        data = data.sort((a, b) => b.value - a.value).slice(0, 5);

        const width = 150;
        const height = 150;
        const radius = Math.min(width, height) / 2;

        const donutInnerOffset = 35;

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
            .innerRadius(radius - donutInnerOffset)  // Creates the hole
            .outerRadius(radius);

        const color = d3.scaleOrdinal<string>()
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


        svg
            .selectAll(`.count`)
            .data(arcData)
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
            .text(d => `${d.data.value}`)
            .style('font-size', '1rem')
            .style("text-anchor", "middle")
            .style('font-weight', `bold`)
            .style('fill', 'black');

        const legend_radius = 8;
        const legend_spacing = 15;

        const legend = svg
            .selectAll('.legend')
            .data(color.domain())
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
            .style('fill', color);

        legend
            .append('text')
            .attr('x', 5 + legend_radius)
            .attr('y', legend_radius / 2)
            .style(`fill`, color)
            .text((d) => `${d}`);
    }
}