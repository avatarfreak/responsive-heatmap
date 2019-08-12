# Data Visualization Projects - Visualize Data with a Heat Map

- Fulfill the below user stories and get all of the tests to pass. Give it your own personal style.

- You can use HTML, JavaScript, CSS, and the D3 svg-based visualization library. The tests require axes to be generated using the D3 axis property, which automatically generates ticks along the axis. These ticks are required for passing the D3 tests because their positions are used to determine alignment of graphed elements. You will find information about generating axes at https://github.com/d3/d3/blob/master/API.md#axes-d3-axis. Required (non-virtual) DOM elements are queried on the moment of each test. If you use a frontend framework (like Vue for example), the test results may be inaccurate for dynamic content. We hope to accommodate them eventually, but these frameworks are not currently supported for D3 projects.

- User Story #1: My heat map should have a title with a corresponding `id="title"`.
- User Story #2: My heat map should have a description with a corresponding `id="description"`.
- User Story #3: My heat map should have an x-axis with a corresponding `id="x-axis"`.
- User Story #4: My heat map should have a y-axis with a corresponding `id="y-axis"`.
- User Story #5: My heat map should have rect elements with a `class="cell"` that represent the data.
- User Story #6: There should be at least 4 different fill colors used for the cells.
- User Story #7: Each cell will have the properties data-month, data-year, data-temp containing their corresponding month, year, and temperature values.
- User Story #8: The data-month, data-year of each cell should be within the range of the data.
- User Story #9: My heat map should have cells that align with the corresponding month on the y-axis.
- User Story #10: My heat map should have cells that align with the corresponding year on the x-axis.
- User Story #11: My heat map should have multiple tick labels on the y-axis with the full month name.
- User Story #12: My heat map should have multiple tick labels on the x-axis with the years between 1754 and 2015.
- User Story #13: My heat map should have a legend with a corresponding `id="legend"`.
- User Story #14: My legend should contain rect elements.
- User Story #15: The rect elements in the legend should use at least 4 different fill colors.
- User Story #16: I can mouse over an area and see a tooltip with a corresponding `id="tooltip"` which displays more information about the area.
- User Story #16: My tooltip should have a data-year property that corresponds to the data-year of the active area.

## Important notes

- This responsive visual graphic chart is built on top of **D3 version 5** library. First thing first, to achieve responisve chart, `window: resize event` is being used.

  ```
  window.addEventListener('resize', somefunction)
  ```

- **D3v5** substituted asynchronous callbacks with promises. Therefore, fetching external data is different from previous version.
  In previous the data used to be fetched in this order

  ```
  var data = d3.json(‘data.json’, function(data){
      //then do something with data
      console.log(data)
  });
  ```

- However, the promises in later version is slightly different from previous one. If, you have no idea what promises is all about? Kindly, do some research on `Javascript’s promises and fetch(url)`. The syntax in **D3v5** looks

  ```
  var data = d3.json(‘data.json’).then(function(data){
      return (data);
  }).catch(function(err){
      console.log(err)
  });
  ```

#### Project Structure

```
Project
│
│   index.html
│   README.md
│   package.json
│
└───src
│   │
│   └───assets
│       └───js
│           └───heatmap.js
|           |___index.js
|
│       └───scss
│            └───main.scss
│
│
│
└───dist
```

### Technologies used

- webpack4
- Babel
- ES6
- svg
- D3.js v5

Clone this repo:

```
$ git clone https://github.com/avatarfreak/responsive-heatmap.git
```

#### Installing:

- clone this project

  - `$ git clone "https://github.com/avatarfreak/responsive-heatmap.git"`
  - `$ cd responsive-scatter-chart`
  - `$ npm install`
  - `$ npm run build`
  - `$ npm run start`

---

#### Author

- [avatarfreak](https://github.com/avatarfreak "avatarfreak")
