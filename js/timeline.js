// Setup
// SVG
var marginTL = {top: 40, right: 100, bottom: 10, left: 25},
    widthTL = 1330 - marginTL.right - marginTL.left,
    heightTL = 200 - marginTL.top - marginTL.bottom;

// Animations
var delay = 100,
    duration = 550;

var paddingTL = 30;

// Axis (x-direction)
// Scale
var scaleX = d3.scaleLinear()
    .range([paddingTL, widthTL-paddingTL])
    .domain([1950, 2019]);

var axisX = d3.axisTop()
    .scale(scaleX)
    .ticks(10, ".0f");

loadTLData();

function loadTLData() {
    // Load json file & Create a local variable
    d3.json("data/timeline.json", function (data) {
        updateTLVis(data);
    });
}

function updateTLVis(data) {
    console.log(data[0].title);
    //create an svg
    var svgTL = d3.select('#timeline').append("svg")
        .attr("width", widthTL + marginTL.right + marginTL.left)
        .attr("height", heightTL + marginTL.top + marginTL.bottom)
      .append("g")
        .attr("transform", "translate("
            + marginTL.left + "," + marginTL.top + ")")
        .call(axisX)
        .attr("class", "axisX");

    //create droplets
    var dropPath = 'M 243.44676,222.01677 C 243.44676,288.9638 189.17548,343.23508 122.22845,343.23508 C 55.281426,343.23508 1.0101458,288.9638 1.0101458,222.01677 C 1.0101458,155.06975 40.150976,142.95572 122.22845,0.79337431 C 203.60619,141.74374 243.44676,155.06975 243.44676,222.01677 z';

    var tooltip = document.getElementById("tooltip"),
        title = d3.select("#title").append("div"),
        year = d3.select("#year").append("div"),
        location = d3.select("#location").append("div"),
        headline = d3.select("#headline").append("div"),
        image = d3.select("#image").append("div"),
        description = d3.select("#description").append("div");

    title.html(data[5]["title"]);
    location.html(data[5]["location"]);
    headline.html(data[5]["headline"]);
    year.html(data[5]["year"]);
    image.html("<img src=" + data[5]["image"] + " />");
    description.html(data[5]["description"]);

    var drops = svgTL.selectAll("g.drop")
        .data(data).enter().append("g")
        .attr("class", "drop")
        .attr("id", function(d){
            return d["id"];
        })
        .attr("transform", function(d){
            return "translate(" + (scaleX(d["year"]-2)) + ", " + (d["y"]) + ") scale(.125)";
        })
        .append("path").attr("d", dropPath)
        .attr("class", function(d) {
            if(d["id"] === 5 || d["id"] === 9 || d["id"] === 12) {
                return "jiggle_drop";
            }
        })
        .attr("y", 0)
        .attr("fill", function(d){
            if(d["type"] === "event"){
                return "#C3FF99";
            }
            else{
                return "#64eeee"
            }
        })
        .on("mouseover", function(d, i) {
            title.html(d["title"]);
            location.html(d["location"]);
            headline.html(d["headline"]);
            year.html(d["year"]);
            image.html("<img src=" + d["image"] + " />");
            description.html(d["description"]);
        })
}
