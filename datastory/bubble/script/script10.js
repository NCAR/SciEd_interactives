var json = null;
var printedList = '';
var selectedYear = 1970;

var svg = d3.select("svg"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleOrdinal()
    .domain([-1, 3])
    .range(['#FFFFFF','#C15320','#264653','#2a9d8f','#e9c46a']);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.json("data/extract_data_regions_year.php?year="+selectedYear, function(error, data){
    if (error) throw error;
    dataViz(data);
});


function printList(json){

    $.each(json, function(index,value){
      if(index == 'children'){
          $.each(value, function(index2,value2){
              printedList += '<div class="datatable_region"><h2>'+value2.name+'</h2><table><tr><th>Country</th><th>GHG Emissions *</th></tr>';
              $.each(value2.children, function(index3,value3){
                  printedList += '<tr><td>'+value3.name+'</td><td>'+d3.format(",")(value3.size)+'</td></tr>';
              });
              printedList += '</table></div>';
          });
      }
    });
    printedList += '<div class="clear"></div></div>';

    document.getElementById('printedList').innerHTML = printedList;
}
function dataViz(root) {


  json = root;
  printList(json);

 root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view;

/*
      var validData = nodes.filter(function (d){
        if((d.depth == 1 && d.data.name == selectedYear) || (d.depth == 2 && d.parent.data.name == selectedYear) || (d.depth == 3 && d.parent.parent.data.name == selectedYear)){

          return d;
        } else {
          console.log(d);
        }
      });
*/
  var circle = g.selectAll("circle")
    .data(nodes)
    .filter(function (d){
      console.log(d);
      if((d.depth == 1 && d.data.name == selectedYear) ||
      (d.depth == 2 && d.parent.data.name == selectedYear) ||
      (d.depth == 3 && d.parent.parent.data.name == selectedYear)){
        console.log(d);
        return d;
      }
    })
    .enter()
      .append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return color(d.depth); });

  circle
      .on("click", function(d) {
        if (focus !== d)
        {
          zoom(d)
        } else {
          zoom(root);
        }
         d3.event.stopPropagation();
      });

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .style("opacity", function(d) {
        return ((d.parent && (d.parent.data.name == 'European Union' || d.parent.data.name == 'Other Developed')) || ((d.data.name.length) < d.r)) ? 1 : 0;
      })
      .append('tspan')
      .text(function(d){
        if((d.data.name.length) > d.r){
          return d.data.name;
        } else {
            return d.data.name;
        }
      })
      .attr('y',0)
      .attr('x',0)
      .append('tspan')
      .text(function(d){
        if(d.data.size != undefined){
          return d3.format(".2s")(d.data.size);
        } else if(d.data.name == 'China' || d.data.name == 'India' || d.data.name == 'United States'){
          return d3.format(".2s")(d.children[0].data.size);
        }
      })
      .attr('y',15)
      .attr('x',0);

  var node = g.selectAll("circle,text");

  var v = [root.x, root.y, root.r * 2.05];
  zoomTo(v);


  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2];
    view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
}


function updateData(){
    d3.json("data/extract_data_regions_cp.php?year="+selectedYear, function(error, root) {
        console.log(root);
    });
  console.log('change');
}




var optionData = new Array();
i = 1960;
maxDate = new Date().getFullYear();
while(i<maxDate){
  optionData.push(i);
  i++;
}

// create drop down select by year
var select = d3.select('.yearOptions')
  .attr('class','select')
  .on('change',onchange)

var options = select
  .selectAll('option')
  .data(optionData).enter()
  .append('option')
  .attr("selected", function(d){
    if(selectedYear == d){
      return "selected";
    }
  })
    .text(function (d) { return d; });
    printedList += '<div class="printedList"><h1>Regions</h1><div>* Total greenhouse gas emissions (kt of CO2 equivalent)<br/>Source: http://data.worldbank.org/indicator/EN.ATM.GHGT.KT.CE</div>';



function onchange() {
  selectedYear = d3.select('select').property('value');
  $('#selectedYearText').html(selectedYear);


  // call new data
  updateData();
};
