// set up vars
var maxWidth = window.innerWidth,
maxHeight = window.innerHeight,
padding = 20,
w = (window.innerHeight < maxHeight ? maxHeight : window.innerWidth - padding),
h = (window.innerWidth < maxWidth ? maxWidth : window.innerHeight - padding),
r = 500,
x = d3.scaleLinear().range([0, r]),
y = d3.scaleLinear().range([0, r]),
width = Math.max($("#chart").width(),maxWidth) - padding,
height = (window.innerWidth < maxHeight ? width : window.innerHeight - padding),
centerX = width/2,
centerY = height/2;

var svg = d3.select("#chart").attr("width", w)
.attr("height", h),
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(2,2)"),
    format = d3.format(",d");

var pack = d3.pack()
    .size([diameter - 4, diameter - 4]);

d3.json("data/extract_data_regions_cp.php", function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var node = g.selectAll(".node")
    .data(pack(root).descendants())
    .enter().append("g")
      .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.data.name + "\n" + format(d.data.size); });

  node.append("circle")
      .attr("r", function(d) { return d.r; });

  node.filter(function(d) { return !d.children; }).append("text")
      .attr("dy", "0.3em")
      .style("opacity", function(d) { return (d.r > padding && (d.data.name.length*2) < d.r) ? 1 : 0; })
      .text(function(d) {
        return d.data.name.substring(0, d.r / 3);
      });



});

function zoom(d, i) {
    var k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
        .attr("cx", function(d) { return x(d.x);  })
        .attr("cy", function(d) { return y(d.y);  })
        .attr("r", function(d)  { return k * d.r; });

    // updateCounter is a hacky way to determine when transition is finished
    var updateCounter = 0;

    t.selectAll("text")
        .style("opacity", 0)
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .each(function(d, i) {
            updateCounter++;
        })
        .each("end", function(d, i) {
            updateCounter--;
            if (updateCounter == 0) {
                adjustLabels(k);
            }
        });

    node = d;
    d3.event.stopPropagation();
}

function adjustLabels(k) {

    svg.selectAll("text")
        .style("opacity", function(d) {
            return k * d.r > 20 ? 1 : 0;
        })
        .text(function(d) {
            return d.name;
        })
        .filter(function(d) {
            d.tw = this.getComputedTextLength();
            return (Math.PI*(k*d.r)/2) < d.tw;
        })
        .each(function(d) {
            var proposedLabel = d.name;
            var proposedLabelArray = proposedLabel.split('');
            while ((d.tw > (Math.PI*(k*d.r)/2) && proposedLabelArray.length)) {
                // pull out 3 chars at a time to speed things up (one at a time is too slow)
                proposedLabelArray.pop();proposedLabelArray.pop(); proposedLabelArray.pop();
                if (proposedLabelArray.length===0) {
                    proposedLabel = "";
                } else {
                    proposedLabel = proposedLabelArray.join('') + "..."; // manually truncate with ellipsis
                }
                d3.select(this).text(proposedLabel);
                d.tw = this.getComputedTextLength();
            }
        });
}
