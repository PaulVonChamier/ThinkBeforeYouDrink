// SVG Size

var margin = {top: 10, right: 200, bottom: 100, left: 300},
    width = 1200 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom;

var i = 0,
    duration = 550,
    root;

loadData();
//updateTreeVis();

function loadData() {
    // Load CSV file & Create a local variable
    d3.json("data/chemicals-tree.json", function (data) {
        var chemicals = [];
        chemicals = data;
        updateTreeVis(chemicals);

    });
}


function updateTreeVis(chemicals) {
    console.log(chemicals);
    //create an svg
    var svg = d3.select('#tree').append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

    // declares a tree layout and assigns the size
    var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
    root = d3.hierarchy(chemicals, function(d) { return d.children; });
    //console.log(root);
    root.x0 = height / 2;
    root.y0 = 0;

// Collapse after the second level
    collapse(root);

    update(root);

// Collapse the node and all it's children
    function collapse(d) {
        if(d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function update(source) {

        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});

        // ****************** Nodes section ***************************

        // Update the nodes...
        var node = svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 15)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("class", "nodelabels")
            .attr("fill", "#fff")
            .attr("x", function(d) {
                return d.children || d._children ? -24 : 24;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.name; })
            .attr("class", "hyper").on("click", clack);

        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 15)
            .style("fill", function(d) {
                return d._children ? "#64eeee" : "#C3FF99";
            })
            .attr('cursor', 'pointer');


        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 20);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        var link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0};
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

            return path
        }

        // Toggle children on click.
        function click(d) {
           if (d.parent){
               //console.log(d.parent.children);
               var sibnodes = d.parent.children;
                   sibnodes.forEach(function(sib){
                       collapse(sib);
                   });
           }

            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;

            }
            update(d);

        }

        function clack(d) {
            if (d.data.name!='Unregulated chemicals'){
                openInNewTab(d.data.url);
                function openInNewTab(url) {
                    var win = window.open(url, "","width=400,height=400");
                    win.focus();
                }
            }

        }

    }
}
