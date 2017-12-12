d3.selectAll("#counter")
    .append("text")
    .attr("x", 100)
    .attr("y", 100)
    .attr("class", "textcounter1")
    .attr("fill", "white")
    .attr("dy", ".35em")
    .attr("text-anchor", "left")
    .text("80,000 ?")
    .style("opacity",1);

$(document).ready(function(){
    $("#precounter").fadeIn(1000);
});


function createCountUp() {
    var options = {
        useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
    };
    var demo = new CountUp('counter', 80000, 96, 0, 3, options);
    if (!demo.error) {
        demo.start();
    } else {
        console.error(demo.error);
    }
    $(document).ready(function() {
        $("#postcounter").delay(3500).fadeIn(1000);
    });
}
