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
    //calculate new dimension, when resize is triggered.
    const display = document.querySelector(".display");
    this.sizes = {
      height: display.clientHeight,
      width: display.clientWidth,
      margin: { top: 20, right: 160, bottom: 180, left: 160 }
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
      .tickValues(this.years.filter(year => year % 20 === 0));

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

  colorScale() {
    const colorScale = d3.scaleQuantize(d3.schemeSet2);
    colorScale.domain(d3.extent(this.data.monthlyVariance, d => d.variance));
    return colorScale;
  }

  addRect() {
    const colorScale = this.colorScale();
    const tooltip = this.tooltip;
    const data = this.data;
    this.rect = this.svg.selectAll("rect").data(data.monthlyVariance);
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
          <label>Temp: <b>${(data.baseTemperature + d.variance).toFixed(
            1
          )}<sup>o</sup>c</b> </label> 
          <br>
          <label>var: <b>${d.variance.toFixed(1)}<sup>o</sup>c</b> </label> 
          `
          )
          .attr("data-year", d.year)
          .style("left", `${d3.event.pageX + 10}px`)
          .style("top", `${d3.event.pageY - 30}px`);
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
    const colorScale = this.colorScale();
    const d = d3.extent(this.data.monthlyVariance, d => d.variance);

    const legendData = d3.range(d[0], d[1]);

    this.legend = this.svg
      .selectAll("#legend")
      .data([null])
      .join("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${-this.innerWidth / 2}, ${margin.top + 25})`
      );

    this.legend
      .selectAll(".legend-rect")
      .data(legendData)
      .join("rect")
      .attr("class", "legend-rect")
      .attr("width", 45)
      .attr("height", 30)
      .attr("x", (d, i) => this.innerWidth + i * 35)
      .attr("y", (d, i) => this.innerHeight)
      .style("fill", d => colorScale(d));

    this.legend
      .selectAll("text")
      .data(legendData)
      .join("text")
      .attr("class", "legend-text")
      .attr("fill", "white")
      .style("font-size", ".8em")
      .attr("x", (d, i) => this.innerWidth + i * 35)
      .attr("y", (d, i) => this.innerHeight + margin.top + 25)
      .text(d => (this.data.baseTemperature + d).toFixed(1));

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
