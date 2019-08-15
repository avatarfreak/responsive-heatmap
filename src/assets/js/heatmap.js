import * as d3 from "d3";
d3.select("#loading").remove();

export class Heatmap {
  constructor(data) {
    this.data = data;
    this.tooltip = d3.select(".display__svg").append("div");
    this.graph = d3.select(".display__svg");
    this.render();
  }

  render() {
    //this.svg = d3.select(".display__svg");
    //calculate new dimension, when resize is triggered.
    const display = document.querySelector(".display");
    this.sizes = {
      height: display.clientHeight,
      width: display.clientWidth,
      margin: { top: 20, right: 60, bottom: 130, left: 90 }
    };

    this.drawCanvas(this.svg, this.sizes)
      .createScale()
      .addAxis()
      .addRect()
      .addTooltip()
      .addLegend();
  }

  drawCanvas(selection, props) {
    const { height, width, margin } = props;

    this.svg = this.graph
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
    const data = this.data.monthlyVariance;
    this.years = [...new Set(data.map(d => d.year))];

    this.xScale = d3
      .scaleBand()
      .domain(this.years)
      .range([0, this.innerWidth])
      .padding(0.1);

    this.yScale = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .range([this.innerHeight, 0]);
    return this;
  }

  addAxis() {
    const xAxis = d3
      .axisBottom(this.xScale)
      .tickValues(this.years.filter(year => year % 20 === 0))
      //.tickFormat(d3.formatPrefix(".0s", 1e2))
      .ticks(this.innerWidth / 70);

    let xAxisGroup = this.svg
      .selectAll("#x-axis")
      .data([null])
      .join("g")
      .attr("id", "x-axis")
      .attr(
        "transform",
        `translate(${this.sizes.margin.left}, ${this.innerHeight +
          this.sizes.margin.top})`
      )
      .call(xAxis);

    const yAxis = d3.axisLeft(this.yScale).tickFormat(d => {
      const timeParse = d3.timeFormat("%B");
      const month = timeParse(new Date(1999 + "-" + d));
      return month;
    });

    this.yAxisGroup = this.svg
      .selectAll("#y-axis")
      .data([null])
      .join("g")
      .attr("id", "y-axis")
      .attr(
        "transform",
        `translate(${this.sizes.margin.left}, ${this.sizes.margin.top})`
      )
      .call(yAxis);
    return this;
  }
  addRect() {
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
    /*
    const colorScale = d3
      .scaleQuantile()
      .domain(d3.extent(this.data.monthlyVariance, d => d.variance))
      .range(colorList);
      */

    /* const colorScale = d3
      .scaleSequential(d3.interpolatePlasma)
      .domain(d3.extent(this.data.monthlyVariance, d => d.variance));
    */
    const tooltip = this.tooltip;

    const colorScale = d3.scaleOrdinal(d3.schemeSet2);
    colorScale.domain(d3.extent(this.data.monthlyVariance, d => d.variance));
    this.rect = this.svg.selectAll("rect").data(this.data.monthlyVariance);
    this.rect
      .join("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => d.variance)
      .attr("x", (d, i) => this.xScale(d.year))
      .attr("y", d => this.yScale(d.month))
      .attr("width", this.xScale.bandwidth)
      .attr("height", this.yScale.bandwidth)
      .attr("fill", d => colorScale(d.variance))
      .attr(
        "transform",
        `translate(${this.sizes.margin.left}, ${this.sizes.margin.top})`
      )
      .on("mouseover", function(d) {
        console.log(this.data);
        const date = new Date(d.year, d.month);
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);
        tooltip
          .html(
            `
          <label>Year: <b>${d.year}</b> </label> 
          <br>
          <label>Month:<b>${d3.timeFormat("%B")(date)}</b></label> 
          <br>
          <label>Temp: <b>${d.variance.toFixed(2)}<sup>o</sup></b> </label> 
          `
          )
          .attr("data-year", d.year)
          .style("left", `${d3.event.pageX}px`)
          .style("top", `${d3.event.pageY}px`);
        d3.select(this).style("opacity", 0.3);
      })
      .on("mouseout", function() {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", "0");
        d3.select(this).style("opacity", 1);
      });

    return this;
  }
  addTooltip() {
    this.tooltip = this.tooltip
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("padding", "5px 7px")
      .style("border", "1px #333 solid")
      .style("border-radius", "5px")
      .style("opacity", 0);
    return this;
  }
  addLegend() {
    const { margin } = this.sizes;
    this.legend = this.svg
      .selectAll("#legend")
      .data([null])
      .join("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${margin.left},${this.innerHeight + margin.top}`
      );

    return this;
  }

  addEvents() {
    this.rect.on("mouseover", function(d, i) {
      alert("h");
    });
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
