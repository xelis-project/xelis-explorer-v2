import * as d3 from 'd3';
import { Box } from "../../../../components/box/box";

export class MempoolTxSizeTreeMap {
    box: Box;

    constructor() {
        this.box = new Box();
    }

    build_chart() {
        this.box.element.replaceChildren();
        const rect = this.box.element.getBoundingClientRect();

        const margin = { top: 0, right: 0, bottom: 0, left: 0 },
            width = rect.width - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        const svg = d3.select(this.box.element)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const data = {
            name: "root",
            children: [
                { name: "A", value: 100 },
                { name: "B", value: 300 },
                { name: "C", value: 200 },
                { name: "D", value: 50 },
                { name: "E", value: 150 }
            ]
        };

        const root = d3.hierarchy(data).sum(function (d) { return d.value });

        d3.treemap()
            .size([width, height])
            .padding(15)
            (root);

        svg
            .selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr("rx", 10)
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            .style("stroke", "none")
            .style("fill", "red");

        svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("x", function (d) { return d.x0 + 5 })
            .attr("y", function (d) { return d.y0 + 20 })
            .text(function (d) { return d.data.name })
            .attr("font-size", "1rem")
            .attr("fill", "white");
    }
}