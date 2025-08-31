import * as d3 from 'd3';
import { BoxChart } from '../../../../components/box_chart/box_chart';
import { PeerLocation } from '../../../../components/peers_map/peers_map';
import { TxBlock } from '../../../../components/tx_item/tx_item';

export class MempoolChartTxsTransfers {
    box_chart: BoxChart;

    constructor() {
        this.box_chart = new BoxChart();
        this.box_chart.element_title.innerHTML = `PAST BLOCKS`;
    }

    build_chart(txs_blocks: TxBlock[]) {
        const margin = { top: 20, right: 0, bottom: 20, left: 0 };
        const rect = this.box_chart.element_content.getBoundingClientRect();
        const width = rect.width - margin.left - margin.right;
        const height = 550 - margin.top - margin.bottom;
        console.log(txs_blocks)
        const block_txs = {} as Record<string, TxBlock[]>;
        txs_blocks.forEach((tx_block) => {
            const { block, tx } = tx_block;
            if (block_txs[block.height]) {
                block_txs[block.height].push(tx_block);
            } else {
                block_txs[block.height] = [tx_block];
            }
        });

        const data = [] as { label: string, tx_count: number, transfer_count: number }[];
        Object.keys(block_txs).forEach(key => {
            const tx_blocks = block_txs[key];
            let transfer_count = 0;
            let tx_count = 0;
            tx_blocks.forEach((tx_block) => {
                const { transfers } = tx_block.tx.data;
                if (transfers) {
                    transfer_count += transfers.length;
                }
                tx_count++;
            });

            data.push({ label: key, tx_count, transfer_count });
        });
        console.log(data)

        /*
        this.box_chart.box.element.replaceChildren();
        const svg = d3.select(this.box_chart.box.element)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const subgroups = ["tx_count", "transfer_count"];
        const groups = data.map(d => d.label);
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.tx_count + d.transfer_count)])
            .nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(["#1f77b4", "#ff7f0e"]);

        const stackedData = d3.stack()
            .keys(subgroups)(data);

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.label))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
            */
    }
}