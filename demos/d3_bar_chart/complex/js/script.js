var url = "http://api.census.gov/data/timeseries/asm/state?get=NAICS_TTL,EMP,PAYANN,GEO_TTL&for=state:*&YEAR=2014&NAICS=31-33&key=81cdc733d3ac0f3496a88eebbed0a31478c403c6";

// make an ajax reqeust
$.getJSON(url)
.then(convertResultsToObjects)  // convert from an array of arrays, to objects
.then(calculateAvgSalary)       // divide payann by num employees
.then(drawBarChart);

function drawBarChart(data) {
  var sortedData = _.sortBy(data, 'averageSalary').reverse();
  var top10states = _.first(sortedData, 10);
  var max = d3.max(top10states, function(d) {return +d.averageSalary; });
  var min = d3.min(top10states, function(d) {return +d.averageSalary; }) * 0.95;

  var x = d3.scale.linear()
      .domain([min, max])
      .range([0, 500]);

  d3.select("#average-salaries").selectAll("div")
    .data(top10states)
      .enter().append("div")
      .style("width", function(d){
        return x(d.averageSalary) + "px";
      })
      .text(function(d){
        return d.GEO_TTL;
      });

  return data;
}

function logResults(data) {
  console.log(data);

  return data;
}

function calculateAvgSalary(data) {
  // iterate (loop) over data, and for each state object, calculate and add the
  // average salaray as a property on that object
  for(var i=0; i < data.length; i++) {
    var currentState = data[i];
    var currentAverage = (parseInt(currentState.PAYANN) / parseInt(currentState.EMP)) * 1000;
    currentState.averageSalary = currentAverage;
  }

  return data; // return the updated data so it can be used by the next function
}

function convertResultsToObjects(response) {
  // grab the header row, since it's always the first row
  var headers = response[0];
  var results = []; // empty array which will store our converted objects

  // for each row, skipping the first (header) row
  for(var row=1; row < response.length; row++) {
    var currentRow = response[row];
    var newRowObj = _.object(headers, currentRow);
    results.push(newRowObj);
  }

  // return the results so they can be used by the next function
  return results;
}
