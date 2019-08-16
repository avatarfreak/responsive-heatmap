import * as d3 from "d3";
d3.select("#loading").remove();

export class Heatmap {
  constructor(data) {
    this.data = data;
    this.tooltip = d3.select(".display__svg").append("div");
    this.graph = d3.select(".display__svg");
    this.innerHeight;
    this.innerWidth;
    this.render();
  }

  render() {
    //calculate new dimension, when resize is triggered.
    const display = document.querySelector(".display");
    this.sizes = {
      height: display.clientHeight,
      width: display.clientWidth,
      margin: { top: 20, right: 80, bottom: 190, left: 80 }
    };

    this.drawCanvas(this.sizes)
      .createScale()
      .addAxis()
      .addRect()
      .addTooltip()
      .addLegend()
      .animate();
  }
  /**
   *
   *
   * @param {Object} props
   * @returns
   * @memberof Heatmap
   */
  drawCanvas(props) {
    const { height, width } = props;

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
    //calculate inner height
    this.innerHeight = height - margin.top - margin.bottom;

    //calculate inner width
    this.innerWidth = width - margin.left - margin.right;

    //filtering out all duplicates year
    this.years = [...new Set(this.data.monthlyVariance.map(d => d.year))];

    //create x-scale
    this.xScale = d3
      .scaleBand()
      .domain(this.years)
      .range([0, this.innerWidth])
      .padding(0.1);

    //create y-scale
    this.yScale = d3
      .scaleBand()
      .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) //months
      .range([this.innerHeight, 0]);
    return this;
  }

  addAxis() {
    const xAxis = d3
      .axisBottom(this.xScale)
      //showing only years divisible by 20 as ticks
      .tickValues(this.years.filter(year => year % 20 === 0));

    //plot x-axis on graph
    let xAxisGroup = this.svg
      .selectAll("#x-axis")
      .data([null])
      .join("g")
      .attr("id", "x-axis")
      .attr( "transform", `translate(${this.sizes.margin.left}, ${this.innerHeight + this.sizes.margin.top})`)
      .call(xAxis)
      //rotate text at axis to 45 deg
      .selectAll("text")
      .style("text-anchor", "end")
      .style("dx", ".8em")
      .style("dy", ".15em")
      .attr("transform", "rotate(-45)");

    const yAxis = d3.axisLeft(this.yScale).tickFormat(d => {
      //parsing month number to string eg. 0 --> January
      const timeParse = d3.timeFormat("%B");
      const month = timeParse(new Date(1999 + "-" + d));
      return month;
    });

    //plot y-axis on graph
    this.yAxisGroup = this.svg
      .selectAll("#y-axis")
      .data([null])
      .join("g")
      .attr("id", "y-axis")
      .attr( "transform", `translate(${this.sizes.margin.left}, ${this.sizes.margin.top})`) .call(yAxis);
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
      .attr("height", 0)
      .attr("fill", d => colorScale(d.variance))
      .attr( "transform", `translate(${this.sizes.margin.left}, ${this.sizes.margin.top})`)
      .on("mouseover", this.mouseover())
      .on("mouseout", this.mouseout());

    return this;
  }
  animate() {
    this.rect = this.svg
      .selectAll(".cell")
      .transition()
      .ease(d3.easeLinear)
      .duration(2000)
      .ease(d3.easeElastic)
      .attr("height", this.yScale.bandwidth);

    return this;
  }
  mouseout() {
    let tooltip = this.tooltip;
    return function() {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", "0");
      d3.select(this).style("opacity", 1);
    };
  }

  mouseover() {
    let tooltip = this.tooltip;
    //dataset
    let data = this.data;
    return function(d) {
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
    };
  }

  //tooltip to show information
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
    const data = this.data;

    const legendScale = d3
      .scaleLinear()
      .domain(
        d3.extent(data.monthlyVariance, d => data.baseTemperature + d.variance)
      )
      .range([0, this.innerWidth]);

    //grouping lengend elements
    const legendAxis = d3.axisBottom(legendScale).ticks(24);
    this.legend = this.svg
      .selectAll("#legend")
      .data([null])
      .join("g")
      .attr("id", "legend")
      .attr( "transform", `translate(${margin.left}, ${this.innerHeight + margin.top + 50})`)
      .call(legendAxis);

    //appending rect to legend
    this.legend
      .selectAll(".legend-rect")
      .data(data.monthlyVariance)
      .join("rect")
      .attr("class", "legend-rect")
      .attr( "width", (data.monthlyVariance.length * 2) / data.monthlyVariance.length)
      .attr("height", 30)
      .attr("x", (d, i) => legendScale(data.baseTemperature + d.variance))
      .attr("y", (d, i) => margin.top)
      .style("fill", (d, i) => colorScale(d.variance));
    return this;
  }
}

//fetch json data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(res => {
  let heatmap = new Heatmap(res);
  //resize window
  window.addEventListener("resize", () => {
    //Initialize Heatmap and pass fetched data
    heatmap.render();
  });
});
