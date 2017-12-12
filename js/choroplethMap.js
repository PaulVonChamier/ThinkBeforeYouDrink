ChoroplethMap = function(_parentElement, _data, _countydata) {

    this.parentElement = _parentElement;
    this.data = _data; //default state data
    this.countydata = _countydata; //zoom in, switch to county data
    this.initVis();
};

/*
 Zooming into a D3 map doesn’t offer further geographical context,
 it only enlarges the selected polygon.
 Therefore we use leaflet implementation
 code reference http://leafletjs.com/examples/choropleth/*/


ChoroplethMap.prototype.initVis = function() {
    var vis = this;
    var osmUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    var osmAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    var osmLayer = new L.TileLayer(osmUrl, {
        minZoom:4,
        maxZoom: 18,
        attribution: osmAttribution
    });

    vis.map = new L.Map("map-area", {center: [37.8, -96.9], zoom: 4, zoomControl: false})
        .addLayer(osmLayer);

    vis.map.addControl(new L.Control.ZoomMin());


    vis.geojson =  L.geoJson(vis.data).addTo(vis.map);
    vis.selected = 'indices.sum';
    $('input[name=ranking-type]').click(function(){
        vis.selected = this.value;
        console.log(vis.selected);
        vis.updateLegend();
    });
    vis.statedata = vis.data;
    vis.map.on('mouseover', function() {
        console.log('mouseover');
        window.setTimeout(vis.map.scrollWheelZoom.enable.bind(vis.map.scrollWheelZoom), 20000);
    });

    vis.map.on('mouseout', vis.map.scrollWheelZoom.disable.bind(vis.map.scrollWheelZoom));

    vis.map.on("zoomend", function (e){
        //zoom based data change,
        //code reference https://gis.stackexchange.com/questions/118510/load-or-di
        var currentZoom = vis.map.getZoom();
        if (currentZoom>=7){
            console.log('switch to county');
            vis.data = vis.countydata;
        }
        else if (currentZoom<7){
            console.log('switch to state');
            vis.data = vis.statedata;
        }
        vis.updateLegend();
    });



    vis.updateLegend();
};




ChoroplethMap.prototype.updateLegend = function() {
    var vis = this;
    if(vis.legendcontrol){
        vis.map.removeControl(vis.legendcontrol);
    }
    if(vis.info){
        vis.map.removeControl(vis.info);
    }
    if (vis.selected === 'indices.sum'){
        var grades = [5, 6, 7, 8, 11],
         colors = ['#f0f9e8','#ccebc5','#a8ddb5','#7bccc4','#43a2ca','#0868ac'];
        vis.color = function (d) {
            if (d){
                return d > 11 ? colors[5]:
                    d > 8  ? colors[4] :
                        d > 7  ? colors[3] :
                            d > 6  ? colors[2] :
                                d > 5   ? colors[1] :
                                    colors[0];
            }
           else {return "#ccc";}
        };
    }
    else {
        //individual class
        var grades = [0, 0.5, 1, 1.5, 2],
            colors = ['#f0f9e8','#ccebc5','#a8ddb5','#7bccc4','#43a2ca','#0868ac'];
        vis.color = function (d) {
            if (d){
                return d > 2 ? colors[5] :
                    d > 1.5  ? colors[4] :
                        d > 1   ? colors[3] :
                            d > 0.5  ? colors[2] :
                                d > 0   ? colors[1]: colors[0];
            }
            else {return '#ccc';}
        };}

    vis.legendcontrol = L.control({position: 'bottomright'});
    vis.legendcontrol.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            labels = ['A','B','C','D','F'];
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + vis.color(grades[i]+0.001) + '"></i> ' + labels[i] +": "+
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        div.innerHTML +=
            '<br>'+'<i style="background:#ccc"></i> ' + 'NA';
        return div;
    };
    vis.legendcontrol.addTo(vis.map);
    vis.wrangleData();
};


/*
 *  Data wrangling
 */
ChoroplethMap.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

};


ChoroplethMap.prototype.updateVis = function() {
    var vis = this;
    vis.data.forEach(function(d){
        d.properties.value=d.properties[vis.selected];
    });


    //add color and mouse event to each polygon
    if(vis.geojson){
        vis.map.removeLayer(vis.geojson);
    }

    vis.geojson =  L.geoJson(vis.data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(vis.map);
    //console.log(vis.geojson);
    //add info box
    vis.info = L.control();

    vis.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    vis.info.update = function (props) {

        if (vis.map.getZoom()>=7){
            this._div.innerHTML = '<h4>Drinking water quality score </h4>' +  (props ?
                '<b>' + props.name + ', ' + props.state + '</b><br />' + props.value.toFixed(2) : 'Hover over a county');
        }
        else {
            this._div.innerHTML = '<h4>Drinking water quality score </h4>' +  (props ?
                '<b>' + props.name  + '</b><br />' + props.value.toFixed(2) : 'Hover over a state');
        }
    };

    vis.info.addTo(vis.map);

    function style(feature) {
        return {
            fillColor: vis.color(feature.properties.value),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        vis.info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        vis.geojson.resetStyle(e.target);
        vis.info.update();
    }

    function zoomToFeature(e) {
        vis.map.fitBounds(e.target.getBounds());
        var layer = e.target;
        //console.log(layer.feature.properties);
        if (vis.selected === 'indices.sum'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>Heavy metals</td> <td>'+layer.feature.properties["metal.indices.avg"].toFixed(2)+' </td></tr>'+
                '<tr><td>Highly fluorinated compounds</td> <td>'+layer.feature.properties["pfas.indices.avg"].toFixed(2)+' </td></tr>'+
                '<tr><td>Synthetic organic contaminants</td> <td>'+layer.feature.properties["soc.indices.avg"].toFixed(2)+' </td></tr>'+
                '<tr><td>Volatile organic contaminants</td> <td>'+layer.feature.properties["voc.indices.avg"].toFixed(2)+' </td></tr>'+
                '<tr><td>Disinfection Byproduct</td> <td>'+layer.feature.properties["dbp.indices.avg"].toFixed(2)+' </td></tr>'+
                '<tr><td>Hormones</td> <td>'+layer.feature.properties["horm.indices.avg"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'metal.indices.avg'){
            console.log('metal table');
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>Vanadium</td> <td>'+layer.feature.properties["indices.max.vanadium"].toFixed(2)+' </td></tr>'+
                '<tr><td>Molybdenum</td> <td>'+layer.feature.properties["indices.max.molybdenum"].toFixed(2)+' </td></tr>'+
                '<tr><td>Cobalt</td> <td>'+layer.feature.properties["indices.max.cobalt"].toFixed(2)+' </td></tr>'+
                '<tr><td>Strontium</td> <td>'+layer.feature.properties["indices.max.strontium"].toFixed(2)+' </td></tr>'+
                '<tr><td>Chromium</td> <td>'+layer.feature.properties["indices.max.chromium"].toFixed(2)+' </td></tr>'+
                '<tr><td>Chromium-6</td> <td>'+layer.feature.properties["indices.max.chromium-6"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'voc.indices.avg'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>1,2,3-trichloropropane</td> <td>'+layer.feature.properties["indices.max.1,2,3-trichloropropane"].toFixed(2)+' </td></tr>'+
                '<tr><td>1,3-butadiene</td> <td>'+layer.feature.properties["indices.max.1,3-butadiene"].toFixed(2)+' </td></tr>'+
                '<tr><td>chloromethane (methyl chloride)</td> <td>'+layer.feature.properties["indices.max.chloromethane"].toFixed(2)+' </td></tr>'+
                '<tr><td>1,1-dichloroethane</td> <td>'+layer.feature.properties["indices.max.1,1-dichloroethane"].toFixed(2)+' </td></tr>'+
                '<tr><td>bromomethane (methyl bromide)</td> <td>'+layer.feature.properties["indices.max.bromomethane"].toFixed(2)+' </td></tr>'+
                '<tr><td>chlorodifluoromethane (HCFC-22)</td> <td>'+layer.feature.properties["indices.max.HCFC-22"].toFixed(2)+' </td></tr>'+
                '<tr><td>bromochloromethane (halon 1011)</td> <td>'+layer.feature.properties["indices.max.Halon 1011"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'soc.indices.avg'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>1,4-dioxane</td> <td>'+layer.feature.properties["indices.max.1,4-dioxane"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'dbp.indices.avg'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>Chlorate</td> <td>'+layer.feature.properties["indices.max.chlorate"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'pfas.indices.avg'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>perfluorooctanesulfonic acid (PFOS)</td> <td>'+layer.feature.properties["indices.max.PFOS"].toFixed(2)+' </td></tr>'+
                '<tr><td>perfluorooctanoic acid (PFOA)</td> <td>'+layer.feature.properties["indices.max.PFOA"].toFixed(2)+' </td></tr>'+
                '<tr><td>perfluorononanoic acid (PFNA)</td> <td>'+layer.feature.properties["indices.max.PFNA"].toFixed(2)+' </td></tr>'+
                '<tr><td>perfluorohexanesulfonic acid (PFHxS)</td> <td>'+layer.feature.properties["indices.max.PFHxS"].toFixed(2)+' </td></tr>'+
                '<tr><td>perfluoroheptanoic acid (PFHpA)</td> <td>'+layer.feature.properties["indices.max.PFHpA"].toFixed(2)+' </td></tr>'+
                '<tr><td>perfluorobutanesulfonic acid (PFBS)</td> <td>'+layer.feature.properties["indices.max.PFBS"].toFixed(2)+' </td></tr>'
            '</table>';
        }
        else if (vis.selected === 'horm.indices.avg'){
            document.getElementById("content-area").innerHTML =
                '<h4>'+layer.feature.properties.name+'</h4>'+
                '<table class = "table-fill">'+
                '<tr><td>17-β-estradiol</td> <td>'+layer.feature.properties["indices.max.17-beta-estradiol"].toFixed(2)+' </td></tr>'+
                '<tr><td>17-α-ethynylestradiol (ethinyl estradiol)</td> <td>'+layer.feature.properties["indices.max.17-alpha-ethynylestrad"].toFixed(2)+' </td></tr>'+
                '<tr><td>16-α-hydroxyestradiol (estriol)</td> <td>'+layer.feature.properties["indices.max.estriol"].toFixed(2)+' </td></tr>'+
                '<tr><td>equilin</td> <td>'+layer.feature.properties["indices.max.equilin"].toFixed(2)+' </td></tr>'+
                '<tr><td>estrone</td> <td>'+layer.feature.properties["indices.max.estrone"].toFixed(2)+' </td></tr>'+
                '<tr><td>testosterone</td> <td>'+layer.feature.properties["indices.max.testosterone"].toFixed(2)+' </td></tr>'+
                '<tr><td>4-androstene-3,17-dione</td> <td>'+layer.feature.properties["indices.max.4-androstene-3,17-dion"].toFixed(2)+' </td></tr>'
            '</table>';
        }
    }

    function onEachFeature(feature, layer) {
        //console.log(layer.feature.properties);
        if (layer.feature.properties.name){ //only county with value will respond
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }
    }
};

