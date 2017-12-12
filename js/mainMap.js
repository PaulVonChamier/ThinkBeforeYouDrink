
var countyData = [];
var stateData = [];

// Variable for the visualization instance
var choroplethMap ;

// Start application by loading the data
loadMapData();


function loadMapData() {
// Use the Queue.js library to read two files
    queue()
        .defer(d3.json, //"data/us-10m.json") //data from https://github.com/topojson/us-atlas#us/10m.json_counties
        "data/county.topo.json") //data from https://github.com/socrata/opendatanetwork.com/blob/master/geo/county.topo.json
        .defer(d3.csv, "data/ucmrByCounty_final.csv")
        .defer(d3.json, "data/us-states.json")// json file source, https://github.com/alignedleft/d3-book/blob/master/chapter_14/us-states.json
        .defer(d3.csv,"data/ucmrByState_final.csv" ) //mean score for each state
        .await(function (error, mapTopJson, ucmrDataCsv, stateJson, stateDataCsv) {
            var usCounties = topojson.feature(mapTopJson, mapTopJson.objects.county).features;
            var usStates = stateJson.features;
            //console.log(stateJson);
            //console.log(usStates);
            //var usCountyBorders = topojson.mesh(mapTopJson, mapTopJson.objects.county,
            //    function(a, b) { return a !== b; });
            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }
            //load csv and convert string to numeric
            ucmrDataCsv.forEach(function (d) {
            // i know, i know, this is embarrassing, any way to make it more elegant?
                d['indices.sum'] = +d['indices.sum'];
                d['counts.sum'] = +d['counts.sum'];
                d['voc.indices.avg'] = +d['voc.indices.avg'];
                d['soc.indices.avg'] = +d['soc.indices.avg'];
                d['metal.indices.avg'] = +d['metal.indices.avg'];
                d['dbp.indices.avg'] = +d['dbp.indices.avg'];
                d['pfas.indices.avg'] = +d['pfas.indices.avg'];
                d['horm.indices.avg'] = +d['horm.indices.avg'];
                d['COUNTY'] = pad(d['COUNTY'],5);
                d['indices.max.1,1-dichloroethane'] = +d['indices.max.1,1-dichloroethane'];
                d['indices.max.1,2,3-trichloropropane'] =+ d["indices.max.1,2,3-trichloropropane"];
                d['indices.max.1,3-butadiene'] = +d['indices.max.1,3-butadiene'];
                d['indices.max.1,4-dioxane'] =+ d["indices.max.1,4-dioxane"];
                d['indices.max.17-alpha-ethynylestrad'] = +d['indices.max.17-alpha-ethynylestrad'];
                d['indices.max.17-beta-estradiol'] =+ d["indices.max.17-beta-estradiol"];
                d['indices.max.4-androstene-3,17-dion'] = +d['indices.max.4-androstene-3,17-dion'];
                d['indices.max.HCFC-22'] =+ d["indices.max.HCFC-22"];
                d['indices.max.Halon 1011'] = +d['indices.max.Halon 1011'];
                d['indices.max.PFBS'] =+ d["indices.max.PFBS"];
                d['indices.max.PFHpA'] = +d['indices.max.PFHpA'];
                d['indices.max.PFHxS'] =+ d["indices.max.PFHxS"];
                d['indices.max.PFNA'] = +d['indices.max.PFNA'];
                d['indices.max.PFOA'] =+ d["indices.max.PFOA"];
                d['indices.max.PFOS'] = +d['indices.max.PFOS'];
                d['indices.max.bromomethane'] =+ d["indices.max.bromomethane"];
                d['indices.max.chlorate'] =+ d["indices.max.chlorate"];
                d['indices.max.chloromethane'] = +d['indices.max.chloromethane'];
                d['indices.max.chromium'] =+ d["indices.max.chromium"];
                d['indices.max.chromium-6'] =+ d["indices.max.chromium-6"];
                d['indices.max.cobalt'] = +d['indices.max.cobalt'];
                d['indices.max.equilin'] =+ d["indices.max.equilin"];
                d['indices.max.estriol'] = +d['indices.max.estriol'];
                d['indices.max.estrone'] =+ d["indices.max.estrone"];
                d['indices.max.germanium'] = +d['indices.max.germanium'];
                d['indices.max.manganese'] =+ d["indices.max.manganese"];
                d['indices.max.molybdenum'] =+ d["indices.max.molybdenum"];
                d['indices.max.n-propylbenzene'] = +d['indices.max.n-propylbenzene'];
                d['indices.max.sec-butylbenzene'] =+ d["indices.max.sec-butylbenzene"];
                d['indices.max.strontium'] = +d['indices.max.strontium'];
                d['indices.max.tellurium'] =+ d["indices.max.tellurium"];
                d['indices.max.testosterone'] = +d['indices.max.testosterone'];
                d['indices.max.vanadium'] =+ d["indices.max.vanadium"];
            });

            var ucmrDataByCountyId = {};
            ucmrDataCsv.forEach(function (d) {
                ucmrDataByCountyId[d['COUNTY']] = d;
            });

            //console.log(usCounties);

            //merge csv data and GeoJSON
            for (var j = 0; j < usCounties.length; j++) {
                //console.log(j);
                var key = usCounties[j].id.substring(9, 14);
                //console.log(key);
                //Copy the data value into the JSON
                if (ucmrDataByCountyId[key] == null) {
                    usCounties[j].properties['name'] = null;
                    usCounties[j].properties['state'] = null;
                    usCounties[j].properties['indices.sum'] = null;
                    usCounties[j].properties['counts.sum'] = null;
                    usCounties[j].properties['voc.indices.avg'] = null;
                    usCounties[j].properties['soc.indices.avg'] = null;
                    usCounties[j].properties['metal.indices.avg'] = null;
                    usCounties[j].properties['dbp.indices.avg'] = null;
                    usCounties[j].properties['pfas.indices.avg'] = null;
                    usCounties[j].properties['horm.indices.avg'] = null;
                    usCounties[j].properties['indices.max.1,1-dichloroethane'] = null;
                    usCounties[j].properties['indices.max.1,2,3-trichloropropane'] = null;
                    usCounties[j].properties['indices.max.1,3-butadiene'] = null;
                    usCounties[j].properties['indices.max.1,4-dioxane'] = null;
                    usCounties[j].properties['indices.max.17-alpha-ethynylestrad'] = null;
                    usCounties[j].properties['indices.max.17-beta-estradiol'] = null;
                    usCounties[j].properties['indices.max.4-androstene-3,17-dion'] = null;
                    usCounties[j].properties['indices.max.HCFC-22'] = null;
                    usCounties[j].properties['indices.max.Halon 1011'] = null;
                    usCounties[j].properties['indices.max.PFBS'] = null;
                    usCounties[j].properties['indices.max.PFHpA'] = null;
                    usCounties[j].properties['indices.max.PFHxS'] = null;
                    usCounties[j].properties['indices.max.PFNA'] = null;
                    usCounties[j].properties['indices.max.PFOA'] = null;
                    usCounties[j].properties['indices.max.PFOS'] = null;
                    usCounties[j].properties['indices.max.bromomethane'] = null;
                    usCounties[j].properties['indices.max.chlorate'] = null;
                    usCounties[j].properties['indices.max.chloromethane'] = null;
                    usCounties[j].properties['indices.max.chromium'] = null;
                    usCounties[j].properties['indices.max.chromium-6'] = null;
                    usCounties[j].properties['indices.max.cobalt'] = null;
                    usCounties[j].properties['indices.max.equilin'] = null;
                    usCounties[j].properties['indices.max.estriol'] = null;
                    usCounties[j].properties['indices.max.estrone'] = null;
                    usCounties[j].properties['indices.max.germanium'] = null;
                    usCounties[j].properties['indices.max.manganese'] =null;
                    usCounties[j].properties['indices.max.molybdenum'] =null;
                    usCounties[j].properties['indices.max.n-propylbenzene'] = null;
                    usCounties[j].properties['indices.max.sec-butylbenzene'] = null;
                    usCounties[j].properties['indices.max.strontium'] = null;
                    usCounties[j].properties['indices.max.tellurium'] = null;
                    usCounties[j].properties['indices.max.testosterone'] = null;
                    usCounties[j].properties['indices.max.vanadium'] = null;
                }
                else {
                    usCounties[j].properties['name'] = ucmrDataByCountyId[key]['countyname'];
                    usCounties[j].properties['state'] = ucmrDataByCountyId[key]['state'];
                    usCounties[j].properties['indices.sum'] = ucmrDataByCountyId[key]['indices.sum'];
                    usCounties[j].properties['counts.sum'] = ucmrDataByCountyId[key]['counts.sum'];
                    usCounties[j].properties['voc.indices.avg'] = ucmrDataByCountyId[key]['voc.indices.avg'];
                    usCounties[j].properties['soc.indices.avg'] = ucmrDataByCountyId[key]['soc.indices.avg'];
                    usCounties[j].properties['metal.indices.avg'] = ucmrDataByCountyId[key]['metal.indices.avg'];
                    usCounties[j].properties['dbp.indices.avg'] = ucmrDataByCountyId[key]['dbp.indices.avg'];
                    usCounties[j].properties['pfas.indices.avg'] = ucmrDataByCountyId[key]['pfas.indices.avg'];
                    usCounties[j].properties['horm.indices.avg'] = ucmrDataByCountyId[key]['horm.indices.avg'];
                    usCounties[j].properties['indices.max.1,1-dichloroethane'] = ucmrDataByCountyId[key]['indices.max.1,1-dichloroethane'];
                    usCounties[j].properties['indices.max.1,2,3-trichloropropane'] = ucmrDataByCountyId[key]['indices.max.1,2,3-trichloropropane'];
                    usCounties[j].properties['indices.max.1,3-butadiene'] = ucmrDataByCountyId[key]['indices.max.1,3-butadiene'];
                    usCounties[j].properties['indices.max.1,4-dioxane'] = ucmrDataByCountyId[key]['indices.max.1,4-dioxane'];
                    usCounties[j].properties['indices.max.17-alpha-ethynylestrad'] = ucmrDataByCountyId[key]['indices.max.17-alpha-ethynylestrad'];
                    usCounties[j].properties['indices.max.17-beta-estradiol'] = ucmrDataByCountyId[key]['indices.max.17-beta-estradiol'];
                    usCounties[j].properties['indices.max.4-androstene-3,17-dion'] = ucmrDataByCountyId[key]['indices.max.4-androstene-3,17-dion'];
                    usCounties[j].properties['indices.max.HCFC-22'] = ucmrDataByCountyId[key]['indices.max.HCFC-22'];
                    usCounties[j].properties['indices.max.Halon 1011'] = ucmrDataByCountyId[key]['indices.max.Halon 1011'];
                    usCounties[j].properties['indices.max.PFBS'] = ucmrDataByCountyId[key]['indices.max.PFBS'];
                    usCounties[j].properties['indices.max.PFHpA'] = ucmrDataByCountyId[key]['indices.max.PFHpA'];
                    usCounties[j].properties['indices.max.PFHxS'] = ucmrDataByCountyId[key]['indices.max.PFHxS'];
                    usCounties[j].properties['indices.max.PFNA'] = ucmrDataByCountyId[key]['indices.max.PFNA'];
                    usCounties[j].properties['indices.max.PFOA'] = ucmrDataByCountyId[key]['indices.max.PFOA'];
                    usCounties[j].properties['indices.max.PFOS'] = ucmrDataByCountyId[key]['indices.max.PFOS'];
                    usCounties[j].properties['indices.max.bromomethane'] = ucmrDataByCountyId[key]['indices.max.bromomethane'];
                    usCounties[j].properties['indices.max.chlorate'] = ucmrDataByCountyId[key]['indices.max.chlorate'];
                    usCounties[j].properties['indices.max.chloromethane'] = ucmrDataByCountyId[key]['indices.max.chloromethane'] ;
                    usCounties[j].properties['indices.max.chromium'] = ucmrDataByCountyId[key]['indices.max.chromium'];
                    usCounties[j].properties['indices.max.chromium-6'] = ucmrDataByCountyId[key]['indices.max.chromium-6'];
                    usCounties[j].properties['indices.max.cobalt'] = ucmrDataByCountyId[key]['indices.max.cobalt'];
                    usCounties[j].properties['indices.max.equilin'] = ucmrDataByCountyId[key]['indices.max.equilin'];
                    usCounties[j].properties['indices.max.estriol'] = ucmrDataByCountyId[key]['indices.max.estriol'];
                    usCounties[j].properties['indices.max.estrone'] = ucmrDataByCountyId[key]['indices.max.estrone'];
                    usCounties[j].properties['indices.max.germanium'] = ucmrDataByCountyId[key]['indices.max.germanium'];
                    usCounties[j].properties['indices.max.manganese'] =ucmrDataByCountyId[key]['indices.max.manganese'] ;
                    usCounties[j].properties['indices.max.molybdenum'] =ucmrDataByCountyId[key]['indices.max.molybdenum'];
                    usCounties[j].properties['indices.max.n-propylbenzene'] = ucmrDataByCountyId[key]['indices.max.n-propylbenzene'] ;
                    usCounties[j].properties['indices.max.sec-butylbenzene'] = ucmrDataByCountyId[key]['indices.max.sec-butylbenzene'];
                    usCounties[j].properties['indices.max.strontium'] = ucmrDataByCountyId[key]['indices.max.strontium'];
                    usCounties[j].properties['indices.max.tellurium'] = ucmrDataByCountyId[key]['indices.max.tellurium'];
                    usCounties[j].properties['indices.max.testosterone'] = ucmrDataByCountyId[key]['indices.max.testosterone'] ;
                    usCounties[j].properties['indices.max.vanadium'] = ucmrDataByCountyId[key]['indices.max.vanadium'];
                }
            }

            //merge geojson with state data
            stateDataCsv.forEach(function (d) {
                d['indices.sum'] = +d['indices.sum'];
                d['counts.sum'] = +d['counts.sum'];
                d['voc.indices.avg'] = +d['voc.indices.avg'];
                d['soc.indices.avg'] = +d['soc.indices.avg'];
                d['metal.indices.avg'] = +d['metal.indices.avg'];
                d['dbp.indices.avg'] = +d['dbp.indices.avg'];
                d['pfas.indices.avg'] = +d['pfas.indices.avg'];
                d['horm.indices.avg'] = +d['horm.indices.avg'];
                d['indices.max.1,1-dichloroethane'] = +d['indices.max.1,1-dichloroethane'];
                d['indices.max.1,2,3-trichloropropane'] =+ d["indices.max.1,2,3-trichloropropane"];
                d['indices.max.1,3-butadiene'] = +d['indices.max.1,3-butadiene'];
                d['indices.max.1,4-dioxane'] =+ d["indices.max.1,4-dioxane"];
                d['indices.max.17-alpha-ethynylestrad'] = +d['indices.max.17-alpha-ethynylestrad'];
                d['indices.max.17-beta-estradiol'] =+ d["indices.max.17-beta-estradiol"];
                d['indices.max.4-androstene-3,17-dion'] = +d['indices.max.4-androstene-3,17-dion'];
                d['indices.max.HCFC-22'] =+ d["indices.max.HCFC-22"];
                d['indices.max.Halon 1011'] = +d['indices.max.Halon 1011'];
                d['indices.max.PFBS'] =+ d["indices.max.PFBS"];
                d['indices.max.PFHpA'] = +d['indices.max.PFHpA'];
                d['indices.max.PFHxS'] =+ d["indices.max.PFHxS"];
                d['indices.max.PFNA'] = +d['indices.max.PFNA'];
                d['indices.max.PFOA'] =+ d["indices.max.PFOA"];
                d['indices.max.PFOS'] = +d['indices.max.PFOS'];
                d['indices.max.bromomethane'] =+ d["indices.max.bromomethane"];
                d['indices.max.chlorate'] =+ d["indices.max.chlorate"];
                d['indices.max.chloromethane'] = +d['indices.max.chloromethane'];
                d['indices.max.chromium'] =+ d["indices.max.chromium"];
                d['indices.max.chromium-6'] =+ d["indices.max.chromium-6"];
                d['indices.max.cobalt'] = +d['indices.max.cobalt'];
                d['indices.max.equilin'] =+ d["indices.max.equilin"];
                d['indices.max.estriol'] = +d['indices.max.estriol'];
                d['indices.max.estrone'] =+ d["indices.max.estrone"];
                d['indices.max.germanium'] = +d['indices.max.germanium'];
                d['indices.max.manganese'] =+ d["indices.max.manganese"];
                d['indices.max.molybdenum'] =+ d["indices.max.molybdenum"];
                d['indices.max.n-propylbenzene'] = +d['indices.max.n-propylbenzene'];
                d['indices.max.sec-butylbenzene'] =+ d["indices.max.sec-butylbenzene"];
                d['indices.max.strontium'] = +d['indices.max.strontium'];
                d['indices.max.tellurium'] =+ d["indices.max.tellurium"];
                d['indices.max.testosterone'] = +d['indices.max.testosterone'];
                d['indices.max.vanadium'] =+ d["indices.max.vanadium"];
            });

            var ucmrDataByName= {};
            stateDataCsv.forEach(function (d) {
                ucmrDataByName[d['name']] = d;
            });
            console.log(ucmrDataByName);

            //merge csv data and GeoJSON
            for (var j = 0; j < usStates.length; j++) {
                //console.log(j)
                var key = usStates[j].properties.name;
                //console.log(key);
                //Copy the data value into the JSON
                if (ucmrDataByName[key] == null) {
                    usStates[j].properties['name'] = null;
                    usStates[j].properties['indices.sum'] = null;
                    usStates[j].properties['counts.sum'] = null;
                    usStates[j].properties['voc.indices.avg'] = null;
                    usStates[j].properties['soc.indices.avg'] = null;
                    usStates[j].properties['metal.indices.avg'] = null;
                    usStates[j].properties['dbp.indices.avg'] = null;
                    usStates[j].properties['pfas.indices.avg'] = null;
                    usStates[j].properties['horm.indices.avg'] = null;
                    usStates[j].properties['indices.max.1,1-dichloroethane'] = null;
                    usStates[j].properties['indices.max.1,2,3-trichloropropane'] = null;
                    usStates[j].properties['indices.max.1,3-butadiene'] = null;
                    usStates[j].properties['indices.max.1,4-dioxane'] = null;
                    usStates[j].properties['indices.max.17-alpha-ethynylestrad'] = null;
                    usStates[j].properties['indices.max.17-beta-estradiol'] = null;
                    usStates[j].properties['indices.max.4-androstene-3,17-dion'] = null;
                    usStates[j].properties['indices.max.HCFC-22'] = null;
                    usStates[j].properties['indices.max.Halon 1011'] = null;
                    usStates[j].properties['indices.max.PFBS'] = null;
                    usStates[j].properties['indices.max.PFHpA'] = null;
                    usStates[j].properties['indices.max.PFHxS'] = null;
                    usStates[j].properties['indices.max.PFNA'] = null;
                    usStates[j].properties['indices.max.PFOA'] = null;
                    usStates[j].properties['indices.max.PFOS'] = null;
                    usStates[j].properties['indices.max.bromomethane'] = null;
                    usStates[j].properties['indices.max.chlorate'] = null;
                    usStates[j].properties['indices.max.chloromethane'] = null;
                    usStates[j].properties['indices.max.chromium'] = null;
                    usStates[j].properties['indices.max.chromium-6'] = null;
                    usStates[j].properties['indices.max.cobalt'] = null;
                    usStates[j].properties['indices.max.equilin'] = null;
                    usStates[j].properties['indices.max.estriol'] = null;
                    usStates[j].properties['indices.max.estrone'] = null;
                    usStates[j].properties['indices.max.germanium'] = null;
                    usStates[j].properties['indices.max.manganese'] =null;
                    usStates[j].properties['indices.max.molybdenum'] =null;
                    usStates[j].properties['indices.max.n-propylbenzene'] = null;
                    usStates[j].properties['indices.max.sec-butylbenzene'] = null;
                    usStates[j].properties['indices.max.strontium'] = null;
                    usStates[j].properties['indices.max.tellurium'] = null;
                    usStates[j].properties['indices.max.testosterone'] = null;
                    usStates[j].properties['indices.max.vanadium'] = null;
                }
                else {
                    usStates[j].properties['name'] = ucmrDataByName[key]['name'];
                    usStates[j].properties['indices.sum'] = ucmrDataByName[key]['indices.sum'];
                    usStates[j].properties['counts.sum'] = ucmrDataByName[key]['counts.sum'];
                    usStates[j].properties['voc.indices.avg'] = ucmrDataByName[key]['voc.indices.avg'];
                    usStates[j].properties['soc.indices.avg'] = ucmrDataByName[key]['soc.indices.avg'];
                    usStates[j].properties['metal.indices.avg'] = ucmrDataByName[key]['metal.indices.avg'];
                    usStates[j].properties['dbp.indices.avg'] = ucmrDataByName[key]['dbp.indices.avg'];
                    usStates[j].properties['pfas.indices.avg'] = ucmrDataByName[key]['pfas.indices.avg'];
                    usStates[j].properties['horm.indices.avg'] = ucmrDataByName[key]['horm.indices.avg'];
                    usStates[j].properties['indices.max.1,1-dichloroethane'] = ucmrDataByName[key]['indices.max.1,1-dichloroethane'];
                    usStates[j].properties['indices.max.1,2,3-trichloropropane'] = ucmrDataByName[key]['indices.max.1,2,3-trichloropropane'];
                    usStates[j].properties['indices.max.1,3-butadiene'] = ucmrDataByName[key]['indices.max.1,3-butadiene'];
                    usStates[j].properties['indices.max.1,4-dioxane'] = ucmrDataByName[key]['indices.max.1,4-dioxane'];
                    usStates[j].properties['indices.max.17-alpha-ethynylestrad'] = ucmrDataByName[key]['indices.max.17-alpha-ethynylestrad'];
                    usStates[j].properties['indices.max.17-beta-estradiol'] = ucmrDataByName[key]['indices.max.17-beta-estradiol'];
                    usStates[j].properties['indices.max.4-androstene-3,17-dion'] = ucmrDataByName[key]['indices.max.4-androstene-3,17-dion'];
                    usStates[j].properties['indices.max.HCFC-22'] = ucmrDataByName[key]['indices.max.HCFC-22'];
                    usStates[j].properties['indices.max.Halon 1011'] = ucmrDataByName[key]['indices.max.Halon 1011'];
                    usStates[j].properties['indices.max.PFBS'] = ucmrDataByName[key]['indices.max.PFBS'];
                    usStates[j].properties['indices.max.PFHpA'] = ucmrDataByName[key]['indices.max.PFHpA'];
                    usStates[j].properties['indices.max.PFHxS'] = ucmrDataByName[key]['indices.max.PFHxS'];
                    usStates[j].properties['indices.max.PFNA'] = ucmrDataByName[key]['indices.max.PFNA'];
                    usStates[j].properties['indices.max.PFOA'] = ucmrDataByName[key]['indices.max.PFOA'];
                    usStates[j].properties['indices.max.PFOS'] = ucmrDataByName[key]['indices.max.PFOS'];
                    usStates[j].properties['indices.max.bromomethane'] = ucmrDataByName[key]['indices.max.bromomethane'];
                    usStates[j].properties['indices.max.chlorate'] = ucmrDataByName[key]['indices.max.chlorate'];
                    usStates[j].properties['indices.max.chloromethane'] = ucmrDataByName[key]['indices.max.chloromethane'] ;
                    usStates[j].properties['indices.max.chromium'] = ucmrDataByName[key]['indices.max.chromium'];
                    usStates[j].properties['indices.max.chromium-6'] = ucmrDataByName[key]['indices.max.chromium-6'];
                    usStates[j].properties['indices.max.cobalt'] = ucmrDataByName[key]['indices.max.cobalt'];
                    usStates[j].properties['indices.max.equilin'] = ucmrDataByName[key]['indices.max.equilin'];
                    usStates[j].properties['indices.max.estriol'] = ucmrDataByName[key]['indices.max.estriol'];
                    usStates[j].properties['indices.max.estrone'] = ucmrDataByName[key]['indices.max.estrone'];
                    usStates[j].properties['indices.max.germanium'] = ucmrDataByName[key]['indices.max.germanium'];
                    usStates[j].properties['indices.max.manganese'] =ucmrDataByName[key]['indices.max.manganese'] ;
                    usStates[j].properties['indices.max.molybdenum'] =ucmrDataByName[key]['indices.max.molybdenum'];
                    usStates[j].properties['indices.max.n-propylbenzene'] = ucmrDataByName[key]['indices.max.n-propylbenzene'] ;
                    usStates[j].properties['indices.max.sec-butylbenzene'] = ucmrDataByName[key]['indices.max.sec-butylbenzene'];
                    usStates[j].properties['indices.max.strontium'] = ucmrDataByName[key]['indices.max.strontium'];
                    usStates[j].properties['indices.max.tellurium'] = ucmrDataByName[key]['indices.max.tellurium'];
                    usStates[j].properties['indices.max.testosterone'] = ucmrDataByName[key]['indices.max.testosterone'] ;
                    usStates[j].properties['indices.max.vanadium'] = ucmrDataByName[key]['indices.max.vanadium'];
                }
            }
                // Update choropleth
                countyData = usCounties;
                stateData = usStates;
                createVis();
            });
}



function createVis() {

    // TO-DO: INSTANTIATE VISUALIZATION
    choroplethMap = new ChoroplethMap("map-area", stateData, countyData);
    console.log(stateData);
}
