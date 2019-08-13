import * as d3 from "d3";
import { set } from "d3-collection";
d3.select("#loading").remove();

export class Heatmap {
  constructor(data) {
    this.data = data;

    this.render();
  }

  render() {
    this.svg = d3.select(".display__svg");
    //calculate new dimension, when resize is triggered.
    const display = document.querySelector(".display");
    this.sizes = {
      height: display.clientHeight,
      width: display.clientWidth,
      margin: { top: 30, right: 30, bottom: 130, left: 90 }
    };

    this.drawCanvas(this.svg, this.sizes)
      .createScale()
      .addAxis();
  }

  drawCanvas(selection, props) {
    const { height, width, margin } = props;

    this.svg = selection
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("height", height)
      .attr("width", width);
    return this;
  }

  createScale() {
    const { width, height, margin } = this.sizes;
    this.innerHeight = height - margin.top - margin.bottom;
    this.innerWidth = width - margin.left - margin.right;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    var colorList = [
      "#5E4FA2",
      "#3288BD",
      "#3288BD",
      "#ABDDA4",
      "#E6F598",
      "#FFFFBF",
      "#FEE08B",
      "#FDAE61",
      "#F46D43",
      "#D53E4F",
      "#9E0142"
    ];
    var colorScale = d3
      .scaleQuantile()
      .domain([0, 12.7])
      .range(colorList);

    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(this.data.monthlyVariance, d => d.year))
      .range([0, this.innerWidth]);

    this.yScale = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .range([0, this.innerHeight]);
    return this;
  }

  addAxis() {
    let { margin } = this.sizes;
    const xAxis = d3
      .axisBottom(this.xScale)
      .tickFormat(d3.formatPrefix(".0s", 1e2))
      .ticks(this.innerWidth / 70);
    //.tickValues(this.years.filter(year => year % 10 === 0));

    let xAxisGroup = this.svg
      .selectAll("#x-axis")
      .data([null])
      .join("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(${margin.left}, ${this.innerHeight})`)
      .call(xAxis);

    const yAxis = d3
      .axisLeft(this.yScale)
      .tickFormat(d => {
        const timeParse = d3.timeFormat("%B");
        const month = timeParse(new Date(1999 + "-" + d));
        return month;
      })

    this.yAxisGroup = this.svg
      .selectAll("#y-axis")
      .data([null])
      .join("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);
    return this;
  }
}
//fetch json data
d3.json("src/assets/global-temp.json").then(res => {
  let heatmap = new Heatmap(res);
  //resize window
  window.addEventListener("resize", () => {
    //Initialize Heatmap and pass fetched data
    heatmap.render();
  });
});
