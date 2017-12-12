setTimeout(updateMapVisualization, 100);


$(document).ready(function(){
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();

        var target = this.hash;
        var $target = $(target);

        $('html, body').animate({
            'scrollTop': $target.offset().top
        }, 1000, 'swing');
    });
});

var xvar;

function getRegionByCounty(arr, value) {

    for (var i=0, iLen=arr.length; i<iLen; i++) {

        if (arr[i].countynamenospace == value) return arr[i].region2;
    }
}

function getStateByCounty(arr, value) {

    for (var i=0, iLen=arr.length; i<iLen; i++) {

        if (arr[i].countynamenospace == value) return arr[i].state;
    }
}

function getCountyByName(arr, value) {

    for (var i=0, iLen=arr.length; i<iLen; i++) {

        if (arr[i].countynamenospace == value) return arr[i].countyname;
    }
}


checkTicks();
function checkTicks() {
    document.getElementById("checkNE").checked = true;
    document.getElementById("checkMA").checked = true;
    document.getElementById("checkSE").checked = true;
    document.getElementById("checkMW").checked = true;
    document.getElementById("checkSW").checked = true;
    document.getElementById("checkNW").checked = true;
    document.getElementById("checkW").checked = true;
}
function uncheckTicks() {
    d3.selectAll(".bySearch").remove();
    $("#checkMA").prop("checked", false);
    $("#checkNE").prop("checked", false);
    $("#checkSE").prop("checked", false);
    $("#checkMW").prop("checked", false);
    $("#checkSW").prop("checked", false);
    $("#checkNW").prop("checked", false);
    $("#checkW").prop("checked", false);
    var countyValue =["c"];
    countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
    console.log(countyValue);
    d3.selectAll("circle").attr('fill', "white");
    var xvar = ["counts.sum"];
    var bubble = svg2.selectAll("circle.search")
        .data(globaldata2.filter(function(obj) { return obj.countynamenospace === countyValue.substr(1); }));
    bubble.enter()
        .append("circle")
        .attr('class', function (d,i) {
            return 'bubble search ' + d.region2 + " c" +d.countynamenospace
        })
        .merge(bubble)
        .attr('r', function(d){ return linearRadius(d.population); })
        //.attr('fill',function(d) { return colorPalette(d.region2)})
        //.transition().duration(800)
        .attr("cx",function(d){ return xScale(d[xvar]); })
        .attr("cy",function(d){ return yScale(d[yvar]); })
        .on("mouseover", function(d){
            d3.selectAll(".bySearch").remove();
            var color = colorPalette(d.region2);
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1] - 6;

            svg2.append("text")
                .attr("id", "tooltip2")
                .attr("x", xPosition)
                .attr("y", yPosition-25)
                .attr("text-anchor", "middle")
                //.attr("font-family", "OpenSans, sans-serif")
                .attr("font-size", "18px")
                .attr("fill", color)
                .attr('stroke', "black")
                .attr('stroke-width', 0.5)
                .text(d.countyname + ", " + d.state);

            svg2.append("text")
                .attr("id", "tooltip3")
                .attr("x", xPosition)
                .attr("y", yPosition-43)
                .attr("text-anchor", "middle")
                //.attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("fill", 'black')
                .transition()
                .duration(250)
                .text( "Contamination result" +": " + d[yvar]);
        })
        .on("mouseout", function(d){
            d3.selectAll(".c" + countyValue).style("opacity", null);
            d3.selectAll("#tooltip2").remove();
            d3.selectAll("#tooltip3").remove();
        });

    d3.select(".c" + countyValue).style("opacity", 1.0);
    selectedCounty = d3.selectAll("." + countyValue);
    console.log(selectedCounty);
    d3.select("#bySearch").remove();
    d3.select("#bySearch").remove();

    for (i = 0; i < selectedCounty._groups["0"].length; i++) {
        svg2.append("text")
            .attr("class", "bySearch")
            .attr("x", selectedCounty._groups["0"][i].cx.animVal.value)
            .attr("y", selectedCounty._groups["0"][i].cy.animVal.value - 25)
            .attr("text-anchor", "middle")
            //.attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", colorPalette(getRegionByCounty(globaldata2, countyValue.substr(1))))
            .attr('stroke', "black")
            .attr('stroke-width', 0.5)
            .text(getCountyByName(globaldata2, countyValue.substr(1))+", "+ selectedCounty._groups["0"][i].__data__["state"]);

        svg2.append("text")
            .attr("class", "bySearch")
            .attr("x", selectedCounty._groups["0"][i].cx.animVal.value)
            .attr("y", selectedCounty._groups["0"][i].cy.animVal.value - 43)
            .attr("text-anchor", "middle")
            //.attr("font-family", "sans-serif")
            .attr("font-size", "18px")
            .attr("fill", 'black')
            .transition()
            .duration(250)
            .text( "Contamination result" +": " + selectedCounty._groups["0"][i].__data__[yvar]);
    }

    //updateMapVisualization();
    d3.selectAll("."+countyValue).attr('fill',function(d) { return colorPalette(getRegionByCounty(globaldata2,countyValue.substr(1)))});
    countyValue = [];
}


//append a new SVG with D3
var padding = 20;

// Margin object with properties for the four directions
var margin = {top: 40, right: 10, bottom: 20, left:60};
// Width and height as the inner dimensions of the chart area
var width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#barchart").append("svg")
    .attr("width", width - 200)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(20,0)");

var svg2 = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom + 75)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//init xScale yScale and radius scale
var xScale = d3.scaleLog().range([padding, width-padding]);
var yScale = d3.scaleLinear().range([height-padding, padding]);
var linearRadius = d3.scaleLinear().range([4,30]);

//use scale to create D3 axis function
var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(8, ",.0f");

var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(4);

var xLabel = svg2.append("text")
    .attr("class","x-label")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .style("color", "white")
    .attr("x", 330 )
    .attr("y", 450 );

var yLabel = svg2.append("text")
    .attr("class","y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -230 )
    .attr("y", -45 )
    .style("color", "white")
    .style("fill", "white")
    .style("text-anchor", "middle");

var yAxisGroup = svg2.append("g")
    .attr("class", "y-axis axisWhite axis")
    .style("font-size", "18px");
var xAxisGroup = svg2.append("g")
    .attr("class", "x-axis axisWhite axis")
    .style("font-size", "18px");


//tooltip
var tooltip = d3.select("#chart-area").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//d3 color palette


var colorPalette = d3.scaleOrdinal()
    .domain(["North-East", "Mid-Atlantic", "South-East", "Mid-West", "South-West", "North-West", "West"])
    .range(["#a6cee3 ", "#1f78b4 ", "#b2df8a ", "#33a02c ", "#fb9a99 ", "#e31a1c ", "#fdc378 "]);



var legend2 = d3.legendColor()
    .scale(colorPalette);

loadMapData();
d3.select("#x-var-input").on("change", updateMapVisualization);
d3.select("#y-var-input").on("change", updateMapVisualization);
d3.select("#search").on("click", uncheckTicks);
//d3.select("#search").on("click", updateMapVisualization);
d3.select("#checkNE").on("change", checkNE);
d3.select("#checkMA").on("change", checkMA);
d3.select("#checkSE").on("change", checkSE);
d3.select("#checkMW").on("change", checkMW);
d3.select("#checkSW").on("change", checkSW);
d3.select("#checkNW").on("change", checkNW);
d3.select("#checkW").on("change", checkW);


var globaldata;
var globaldata2;

function roundTo(n, digits) {
    if (digits === undefined) {
        digits = 0;
    }

    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    var test =(Math.round(n) / multiplicator);
    return +(test.toFixed(digits));
}

// Load CSV file
function loadMapData() {
    d3.csv("data/cleandata.csv", function (csv) {
        //convert string to numeric
        csv.forEach(function (d) {
            d.COUNTY = +d.COUNTY;
            d.ZIPCODE = +d.ZIPCODE;
            d.population = +d.population;
            d.ID = +d.ID;
            d["indices.sum"] = roundTo(+d["indices.sum"], 2);
            d["counts.sum"] = roundTo(+d["counts.sum"], 2);
            d["voc.indices.avg"] = roundTo(+d["voc.indices.avg"], 2);
            d["soc.indices.avg"] = roundTo(+d["soc.indices.avg"], 2);
            d["metal.indices.avg"] = roundTo(+d["metal.indices.avg"], 2);
            d["dbp.indices.avg"] = roundTo(+d["dbp.indices.avg"], 2);
            d["pfas.indices.avg"] = roundTo(+d["pfas.indices.avg"], 2);
            d["horm.indices.avg"] = roundTo(+d["horm.indices.avg"], 2);
        });

        //sort data by population
        // csv.sort(function (a, b) {
        //     return b["indices.sum"] - a["indices.sum"]
        // });
        //store csv data in global variable
        globaldata = csv;
        console.log(globaldata);
        //draw visualization
        updateMapVisualization();
    });



}



function updateMapVisualization(){
    d3.selectAll(".rectangles1").remove();
    d3.selectAll(".texts1").remove();
    d3.selectAll(".texts2").remove();
    d3.selectAll(".bySearch").remove();

    var xvar = ["counts.sum"];
    $('input[name=ranking-select]').click(function(){
        yvar = this.value;
    });
    // var yvar = document.getElementById("y-var-input").value.toString();
    if (typeof yvar === 'undefined') {
        yvar = "indices.sum";
    }
    console.log(yvar);
    // d3.select(".label-five").text(function (d,i) {
    //     return "Five counties with the highest" + yvar + "contamination results";
    // });

    function getContaminationByCounty(arr, value) {
        for (var i=0, iLen=arr.length; i<iLen; i++) {
            //console.log(value);
            //console.log(yvar);
            if (arr[i].countynamenospace === value) {
                //console.log(arr[i]);
                return arr[i][yvar];
            }
        }
    }

    //filter to only data points with no missing
    globaldata2 = globaldata;

    var countyValue =["c"];

    countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
    console.log(countyValue);


    //update scale domains

    xScale.domain([d3.min(globaldata2, function(d){
        return d[xvar];
    }),
        d3.max(globaldata2, function(d){
            return d[xvar];
        })]);
    yScale.domain([d3.min(globaldata2, function(d){
        return d[yvar];
    }), d3.max(globaldata2, function(d){
        return d[yvar];
    })]);

    //map the countries to SVG circles

    // scale for radius
    linearRadius.domain([d3.min(globaldata2, function(d){
        return d.population;
    }),
        d3.max(globaldata2, function(d){
            return d.population;
        })]);

    svg2.select(".y-axis")
        .transition().delay(800)
        .duration(800)
        .call(yAxis);

    svg2.select(".x-axis")
        .transition().delay(800)
        .duration(800)
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    var bubble = svg2.selectAll("circle")
        .data(globaldata2);

    bubble.enter()
        .append("circle")
        .attr('class', function (d,i) {
            return 'bubble ' + d.region2 + " c" +d.countynamenospace
        })
        .merge(bubble)
        .attr('r', function(d){ return linearRadius(d.population); })
        .attr('fill',function(d) { return colorPalette(d.region2);})
        .transition().duration(800)
        .attr("cx",function(d){ return xScale(d[xvar]); })
        .attr("cy",function(d){ return yScale(d[yvar]); });

    // Creating the barchart
    //
    // create a copy of data set for the barchart
    var globaldata3 = globaldata2.slice();
    globaldata3.sort(function (a, b) {
        return b[yvar] - a[yvar];
    });

    var rectangle = svg.selectAll(".rectangles1")
        .data(function(){
            return(globaldata3.slice(0, 5));
        });

    rectangle
        .enter()
        .merge(rectangle)
        .append("rect")
        .attr("class", "rectangles1")
        .attr("x", 0)
        .attr("y", function (d,i) {
            return 75*i ;
        })
        .attr("height", 70)
        .attr("fill", function (d) {
            return (colorPalette(d.region2));
        })
        .attr("width", function(d, i) {
            return (d[yvar] * 10);
        });

    var texts1 = svg.selectAll("text.texts1")
        .data(globaldata3.slice(0, 5))
        .enter()
        .append("text")
        .attr("x", function (d,i) {
            return 6 + d[yvar]*10 ;
        })
        .attr("y", function (d,i) {
            return 65 + 75*i  ;
        })
        .attr("class", "texts1 rectangles1")
        .attr("fill", "white")
        .attr("dy", ".35em")
        .attr("text-anchor", "left")
        .text(function (d,i) {
            return d.countyname + ", " + d.state;
        })
        .style("opacity",1);

    var texts2 = svg.selectAll("text.texts2")
        .data(globaldata3.slice(0, 5))
        .enter()
        .append("text")
        .attr("x", function (d,i) {
            return 3 + d[yvar]*10 ;
        })
        .attr("y", function (d,i) {
            return 28 + 75*i  ;
        })
        .attr("class", "texts2")
        .attr("fill", "white")
        .attr("dy", ".35em")
        .attr("text-anchor", "left")
        .text(function (d,i) {
            return d[yvar];
        })
        .style("opacity",1);



    // tooltip mouseover event handler
    //tooltip code is from http://bl.ocks.org/mattparrilla/5724610
    svg2.selectAll(".bubble")
        .on("mouseover", function(d){
            console.log(d.region2);
            d3.selectAll(".bySearch").remove();
            var color = colorPalette(d.region2);
            var xPosition = d3.mouse(this)[0];
            var yPosition = d3.mouse(this)[1] - 6;

            svg2.append("text")
                .attr("id", "tooltip2")
                .attr("x", xPosition)
                .attr("y", yPosition-25)
                .attr("text-anchor", "middle")
                //.attr("font-family", "OpenSans, sans-serif")
                .attr("font-size", "18px")
                .attr("fill", color)
                .attr('stroke', "black")
                .attr('stroke-width', 0.5)
                .text(d.countyname + ", " + d.state);

            svg2.append("text")
                .attr("id", "tooltip3")
                .attr("x", xPosition)
                .attr("y", yPosition-43)
                .attr("text-anchor", "middle")
                //.attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("fill", 'black')
                .transition()
                .duration(250)
                .text( "Contamination result" +": " + d[yvar]);
        })
        .on("mouseout", function(d){
            d3.selectAll(".c" + countyValue).style("opacity", null);
            d3.selectAll("#tooltip2").remove();
            d3.selectAll("#tooltip3").remove();
        });

    svg2.select(".x-label")
        .text("Number of water quality samplings conducted in a county")
        .style("color", "white")
        .style("font-size","18px");
    svg2.select(".y-label")
        .text("Water Contamination Index")
        .style("font-size","18px");



    function checkNE1() {
        if(d3.select("#checkNE").property("checked")){
            console.log('checked');
            d3.selectAll(".North-East").attr('fill',function(d){ return colorPalette('North-East'); })
        }
        else{
            d3.selectAll(".North-East").attr('fill', "white");
        }
    }
    function checkMA1() {
        if(d3.select("#checkMA").property("checked")){
            console.log('checked');
            d3.selectAll(".Mid-Atlantic").attr('fill',function(d){ return colorPalette('Mid-Atlantic'); })
        }
        else{
            d3.selectAll(".Mid-Atlantic").attr('fill', "white");
        }
    }
    function checkSE1() {
        if(d3.select("#checkSE").property("checked")){
            console.log('checked');
            d3.selectAll(".South-East").attr('fill',function(d){ return colorPalette('South-East'); })
        }
        else{
            d3.selectAll(".South-East").attr('fill', "white");
        }
    }
    function checkMW1() {
        if(d3.select("#checkMW").property("checked")){
            console.log('checked');
            d3.selectAll(".Mid-West").attr('fill',function(d){ return colorPalette('Mid-West'); })
        }
        else{
            d3.selectAll(".Mid-West").attr('fill', "white");
        }
    }
    function checkSW1() {
        if(d3.select("#checkSW").property("checked")){
            console.log('checked');
            d3.selectAll(".South-West").attr('fill',function(d){ return colorPalette('South-West'); })
        }
        else{
            d3.selectAll(".South-West").attr('fill', "white");
        }
    }
    function checkNW1() {
        if(d3.select("#checkNW").property("checked")){
            console.log('checked');
            d3.selectAll(".North-West").attr('fill',function(d){ return colorPalette(['North-West']); })
        }
        else{
            d3.selectAll(".North-West").attr('fill', "white");
        }
    }
    function checkW1() {
        if(d3.select("#checkW").property("checked")){
            console.log('checked');
            d3.selectAll(".West").attr('fill',function(d){ return colorPalette(["West"]); })
        }
        else{
            d3.selectAll(".West").attr('fill', "white");
        }
    }
    checkNE1();
    checkMA1();
    checkMW1();
    checkNW1();
    checkSE1();
    checkW1();
    checkSW1();

    d3.select(".bubble").style("opacity", null);
}


function checkNE() {
    if (d3.select("#checkNE").property("checked")) {
        console.log('checked');
        var xvar = ["counts.sum"];
        d3.selectAll(".North-East").remove();
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        var bubble = svg2.selectAll("North-East")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "North-East"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "North-East " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".North-East").attr('fill', function (d) { return colorPalette('North-East'); })
    }
    else {
        d3.selectAll(".North-East").attr('fill', "white");
    }
}
function checkMA() {
    if(d3.select("#checkMA").property("checked")){
        console.log('checked');
        var xvar = ["counts.sum"];
        d3.selectAll(".Mid-Atlantic").remove();
        var bubble = svg2.selectAll("Mid-Atlantic")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "Mid-Atlantic"; }));
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "Mid-Atlantic " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".Mid-Atlantic").attr('fill',function(d){ return colorPalette('Mid-Atlantic'); })
    }
    else{
        d3.selectAll(".Mid-Atlantic").attr('fill', "white");
    }
}
function checkSE() {
    if(d3.select("#checkSE").property("checked")){
        console.log('checked');
        var xvar = ["counts.sum"];
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        d3.selectAll(".South-East").remove();
        var bubble = svg2.selectAll("South-East")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "South-East"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "South-East " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".South-East").attr('fill',function(d){ return colorPalette('South-East'); })
    }
    else{
        d3.selectAll(".South-East").attr('fill', "white");
    }
}
function checkMW() {
    if(d3.select("#checkMW").property("checked")){
        console.log('checked');
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        var xvar = ["counts.sum"];
        d3.selectAll(".Mid-West").remove();
        var bubble = svg2.selectAll("Mid-West")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "Mid-West"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "Mid-West " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".Mid-West").attr('fill',function(d){ return colorPalette('Mid-West'); })
    }
    else{
        d3.selectAll(".Mid-West").attr('fill', "white");
    }
}
function checkSW() {
    if(d3.select("#checkSW").property("checked")){
        console.log('checked');
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        var xvar = ["counts.sum"];
        d3.selectAll(".South-West").remove();
        var bubble = svg2.selectAll("South-West")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "South-West"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "South-West " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".South-West").attr('fill',function(d){ return colorPalette('South-West'); })
    }
    else{
        d3.selectAll(".South-West").attr('fill', "white");
    }
}
function checkNW() {
    if(d3.select("#checkNW").property("checked")){
        console.log('checked');
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        var xvar = ["counts.sum"];
        d3.selectAll(".North-West").remove();
        var bubble = svg2.selectAll("North-West")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "North-West"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "North-West " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".North-West").attr('fill',function(d){ return colorPalette('North-West'); })
    }
    else{
        d3.selectAll(".North-West").attr('fill', "white");
    }
}
function checkW() {
    if(d3.select("#checkW").property("checked")){
        console.log('checked');
        var countyValue =["c"];
        countyValue += document.getElementById("searchBox").value.toUpperCase().replace(/\s+/g, '-');
        var xvar = ["counts.sum"];
        d3.selectAll(".West").remove();
        var bubble = svg2.selectAll("West")
            .data(globaldata2.filter(function(obj) { return obj.region2 === "West"; }));
        bubble.enter()
            .append("circle")
            .attr('class', function (d,i) {
                return 'bubble ' + "West " + " c" +d.countynamenospace
            })
            .merge(bubble)
            .attr('r', function(d){ return linearRadius(d.population); })
            //.attr('fill',function(d) { return colorPalette(d.region2)})
            //.transition().duration(800)
            .attr("cx",function(d){ return xScale(d[xvar]); })
            .attr("cy",function(d){ return yScale(d[yvar]); })
            .on("mouseover", function(d){
                d3.selectAll(".bySearch").remove();
                var color = colorPalette(d.region2);
                var xPosition = d3.mouse(this)[0];
                var yPosition = d3.mouse(this)[1] - 6;

                svg2.append("text")
                    .attr("id", "tooltip2")
                    .attr("x", xPosition)
                    .attr("y", yPosition-25)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "OpenSans, sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", color)
                    .attr('stroke', "black")
                    .attr('stroke-width', 0.5)
                    .text(d.countyname + ", " + d.state);

                svg2.append("text")
                    .attr("id", "tooltip3")
                    .attr("x", xPosition)
                    .attr("y", yPosition-43)
                    .attr("text-anchor", "middle")
                    //.attr("font-family", "sans-serif")
                    .attr("font-size", "18px")
                    .attr("fill", 'black')
                    .transition()
                    .duration(250)
                    .text( "Contamination result" +": " + d[yvar]);
            })
            .on("mouseout", function(d){
                d3.selectAll(".c" + countyValue).style("opacity", null);
                d3.selectAll("#tooltip2").remove();
                d3.selectAll("#tooltip3").remove();
            });
        d3.selectAll(".West").attr('fill',function(d){ return colorPalette('West'); })
    }
    else{
        d3.selectAll(".West").attr('fill', "white");
    }
}





