function addComas(n) {
  var formatValue = d3.format("0,000");
  return formatValue(Math.round(n*10)/10)
    .replace(",", ";")
    .replace(".", ",")
    .replace(";", ".")
}
var colores = new Array("#ECC5B4", "#E3A78F", "#D9886C", "#D0694C", "#A55036");
// var colores = new Array("rgb(180,191,240)", "rgb(164,177,237)", "rgb(128,146,232)", "rgb(99,121,229)", "rgb(10,68,225)");

var labelCriteri = {
  num_casos2: 'Nous casos',
  num_casos2_100kh: 'Nous casos / 100M Hab',
  num_casos_cum2: 'Total casos',
  num_casos_cum2_100kh: 'Total casos / 100M Hab',
  num_hosp: 'Noves hospitalitzacions',
  num_hosp_100kh: 'Noves hospis. / 100M Hab',
  num_hosp_cum: 'Total hospitalitzacions',
  num_hosp_cum_100kh: 'Total hospis / 100M Hab',
  num_uci: 'Nous ingressos UCI',
  num_uci_100kh: 'Nous ingressos UCI / 100M Hab',
  num_uci_cum: 'Total ingressos UCI',
  num_uci_cum_100kh: 'Total ingressos UCI / 100M Hab',
  num_def: 'Nous decessos',
  num_def_100kh: 'Nous decessos / 100M Hab',
  num_def_cum: 'Total decessos',
  num_def_cum_100kh: 'Total decessos / 100M Hab',
  num_casos_avg7: 'Casos / 7 dies'
}

var rangos = {
  num_casos2: [5000,1000,200,100],
  num_casos_cum2: [100000,50000,10000,1000],
  num_casos_avg7: [500,300,150,50],
  num_hosp: [1000,500,100,50],
  num_hosp_cum: [15000,7500,3000,500],
  num_uci: [50,25,10,5],
  num_uci_cum: [1000,500,250,100],
  num_def: [100,50,25,10],
  num_def_cum: [2000,1000,500,200],
  num_casos2_100kh: [750,400,150,50],
  num_casos_cum2_100kh: [8000,5000,2000,800],
  num_hosp_100kh: [50,25,10,5],
  num_hosp_cum_100kh: [1000,500,250,100],
  num_uci_100kh: [5,3,2,0],
  num_uci_cum_100kh: [80,40,20,10],
  num_def_100kh: [25,15,5,0],
  num_def_cum_100kh: [300,150,75,25]
}

function curCriteri() {
  return document.getElementById('criteri').value;
}

function getColor(d) {
  var criteri = rangos[curCriteri()];
  return d > criteri[0]
    ? colores[4]
    : d > criteri[1]
    ? colores[3]
    : d > criteri[2]
    ? colores[2]
    : d > criteri[3]
    ? colores[1]
    : colores[0];
}

function refreshLeyenda() {
  var rangs = rangos[curCriteri()];
  document.getElementById('tr1').innerHTML = addComas(rangs[3]);
  document.getElementById('tr2').innerHTML = addComas(rangs[2]);
  document.getElementById('tr3').innerHTML = addComas(rangs[1]);
  document.getElementById('tr4').innerHTML = addComas(rangs[0]);
}


var div = d3
  .select("#wrapper")
  .append("div")
  .attr("class", "tooltip")
  .attr("opacity", 0);

var wmap = 600;
var hmap = 520;
var hCan = 100;
var wCan = 240;
var projection = d3.geo
  .mercator()
  .translate([410, 2140])
  .scale(2500);
var path = d3.geo.path().projection(projection);
var map = d3
  .select("#mapa")
  .append("svg")
  .attr("width", wmap)
  .attr("height", hmap);
var projectionCan = d3.geo
  .mercator()
  .translate([810, 1350])
  .scale(2500);
var pathCan = d3.geo.path().projection(projectionCan);
var mapCan = d3
  .select("#canarias")
  .append("svg")
  .attr("width", wCan)
  .attr("height", hCan);

var height = 330,
  width = 885,
  trans = 60;
var w = 950,
  h = 380;
var aux = 62;
var width_slider = 920;
var height_slider = 50;

var datosUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/datos_semana_agregados.json';
var provinciasUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/Provincias.json';
var canarianUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/canarian.json';

d3.json(datosUrl, function(dJson) {
  d3.json(provinciasUrl, function(json) {
    d3.json(canarianUrl, function(can) {

      /* ------SLIDER----- */
      var svg = d3
        .select("#slider")
        .attr("class", "chart")
        .append("svg")
        .attr("width", width_slider)
        .attr("height", height_slider);

      var pointerdata = [
        {
          x: 0,
          y: 0
        },
        {
          x: 0,
          y: 25
        },
        {
          x: 25,
          y: 25
        },
        {
          x: 25,
          y: 0
        }
      ];

      var scale2 = d3.scale
          .linear()
          .domain([0,62])
          .rangeRound([0, width]);

      var x = d3.svg
        .axis()
        .scale(scale2)
        .orient("top")
        .tickFormat(function(d) {
          return d;
        })
        .tickSize(0);
        // .tickValues(axisyears);
      svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 15 + ",0)")
        .call(x);
      var drag = d3.behavior
        .drag()
        .origin(function() {
          return {
            x: d3.select(this).attr("x"),
            y: d3.select(this).attr("y")
          };
        })
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

      svg
        .append("g")
        .append("rect")
        .attr("class", "slideraxis")
        .attr("width", width_slider)
        .attr("height", 7)
        .attr("x", 0)
        .attr("y", 16);
      var cursor = svg
        .append("g")
        .attr("class", "move")
        .append("svg")
        .attr("x", width)
        .attr("y", 7)
        .attr("width", 30)
        .attr("height", 60);

      cursor.call(drag);
      var drawline = d3.svg
        .line()
        .x(function(d) {
          return d.x;
        })
        .y(function(d) {
          return d.y;
        })
        .interpolate("linear");

      //---------------------------
      cursor
        .append("path")
        .attr("class", "cursor")
        .attr("transform", "translate(" + 7 + ",0)")
        .attr("d", drawline(pointerdata));
      cursor.on("mouseover", function() {
        d3.select(".move").style("cursor", "hand");
      });

      function dragmove() {
        var x = Math.max(0, Math.min(width, d3.event.x));

        d3.select(this).attr("x", x);
        var z = parseInt(scale2.invert(x));
        aux = z;

        drawMap(z);
      }

      function dragstart() {
        d3.select(".cursor").style("fill", "#D9886C");
      }

      function dragend() {
        d3.select(".cursor").style("fill", "");
      }


      var cont = map
        .selectAll("#mapa path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("d", path)
        .style("fill", function(d) {
          return getColor(d.properties.value);
        })
        .attr("fill-opacity", "1")
        .attr("stroke", "#202020")
        .attr("stroke-width", 0.3)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
          .on("click", clickProvince);
      
      //canarias
      var isl = mapCan
        .selectAll("#canarias path")
        .data(can.features)
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("d", pathCan)
        .style("fill", function(d) {
          return getColor(d.properties.value);
        })
        .attr("fill-opacity", "1")
        .attr("stroke", "#202020")
        .attr("stroke-width", 0.3)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("click", clickProvince);


      function clickProvince(d) {
        var curWeekKey = Object.keys(dJson)[aux];
        var weekData = dJson[curWeekKey];
        var mapCode = d.properties.code;
        var nomProv = d.properties.name;

        var values = []
        curCrit = curCriteri();
        var nomCriteri = labelCriteri[curCrit];
        Object.values(dJson).map(d => {
          values.push( d[mapCode][curCrit] );
        })

        // Dibuixar la gràfica en si
        var margin = {left: 50, right: 20, top: 20, bottom: 50 };
        var width = 550 - margin.left - margin.right;
        var height = 360 - margin.top - margin.bottom;

        var max = 0;
        var xNudge = 50;
        var yNudge = 20;

        max = d3.max(values, function(d) { return d; });
        minDate = 0;
        maxDate = 62;

        var y = d3.scale.linear()
            .domain([0,max])
            .range([height,0]);

        var x = d3.scale.linear()
            .domain([minDate,maxDate])
            .range([0,width]);

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(x);

        var i = -1;
        var line = d3.svg.line()
            .x(function(d) {
              i++;
              return x(i);
            })
            .y(function(d){
              return y(d);
            })
            .interpolate("cardinal");


        var elGrafica = document.getElementById('grafica');
        document.getElementById('grafica-nomprov').innerHTML = nomProv;
        document.getElementById('grafica-nomvar').innerHTML = nomCriteri;
        elGrafica.style.display = 'block';
        document.getElementById('grafica-content').innerHTML = '';
        var svg = d3.select("#grafica-content").append("svg").attr("id","svg").attr("height","100%").attr("width","100%");
        var chartGroup = svg.append("g").attr("class","chartGroup").attr("transform","translate("+xNudge+","+yNudge+")");

        chartGroup.append("path")
            .attr("class","line")
            .attr("d",function(d) {
              return line(values);
            })

        chartGroup.append("g")
            .attr("class","axis x")
            .attr("transform","translate(0,"+height+")")
            .call(xAxis);

        chartGroup.append("g")
            .attr("class","axis y")
            .call(yAxis);

      }


      function mouseover(d) {
        d3.select(this)
          .attr("stroke-width", "1px")
          .attr("fill-opacity", "0.9");
        return ;
      }

      function mouseout(d) {
        d3.select(this)
          .attr("stroke-width", ".3")
          .attr("fill-opacity", "1");
        div.style("opacity", 0);
      }

      function mousemove(d) {
        div.style({
          left: function() {
            if (d3.event.pageX > 780) {
              return d3.event.pageX - 180 + "px";
            } else {
              return d3.event.pageX + 23 + "px";
            }
          },
          top: d3.event.pageY - 20 + "px"
        });
      }

      function drawMap(index) {
        curWeekFrom = Object.keys(dJson)[index-1];
        if (!curWeekFrom)
          curWeekFrom = '2020-02-28'
        curWeekTo = Object.keys(dJson)[index];
        curWeekFrom = curWeekFrom.substring(8, 11) + '/' + curWeekFrom.substring(5, 7) + '/' + curWeekFrom.substring(0, 4);
        curWeekTo = curWeekTo.substring(8, 11) + '/' + curWeekTo.substring(5, 7) + '/' + curWeekTo.substring(0, 4);

        d3.select("#setmana_rang").html(curWeekFrom + ' - ' + curWeekTo);

        // Setmana seleccionada
        var curWeekKey = Object.keys(dJson)[index];
        var weekData = dJson[curWeekKey];

        cont.style("fill", function(d) {

          var mapCode = d.properties.code;
          var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
          var dataProv = weekData[curProvKey];
          // Actualizar el valor
          d.properties.value = dataProv[curCriteri()];

          var value = d.properties.value;
          if (value) {
            return getColor(value);
          } else {
            return "#ccc";
          }

        });


      // Informació detallada de la província en què es fa hover
      function provMouseMove(d) {
        var mapCode = d.properties.code;
        var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
        var dataProv = weekData[curProvKey];
        var keyCriteri = curCriteri();
        var label = labelCriteri[keyCriteri];
        var valueCriteri = addComas(dataProv[keyCriteri]);

        var htInnerKeys = '';
        for (const key of Object.keys(labelCriteri)) {
          if (key == keyCriteri) continue;
          var valueOtherCriteri = addComas(dataProv[key]);
          htInnerKeys += `<tr><td>${labelCriteri[key]}:</td> <td style="text-align: right;"><b>${valueOtherCriteri}</b></td></tr>`;
          console.log(key);
        }
        var htOtherKeys = `<div style="border-top: 1px solid black; margin-top: 16px; padding-top: 14px; margin-bottom: 10px"><table>${htInnerKeys}</table></div>`;

        div.style("opacity", 0.9);
        div
            .html(
                `<div><b>${dataProv['province']}</b></div>` +
                `<div style="margin-top: 10px;">${label}: <b>${valueCriteri}</b></div>` + htOtherKeys
            )
            .style("left", function () {
              if (d3.event.pageX > 780) {
                return d3.event.pageX - 180 + "px";
              } else {
                return d3.event.pageX + 23 + "px";
              }
            })
            .style("top", d3.event.pageY - 20 + "px")
            .style("width", "auto");
      }

      // Events per espanya continental i ses illes
      cont
        .on("mousemove", function(d) {
          provMouseMove(d)
        })
        .on("mouseout", function() {
          return div.style("opacity", 0);
        })
        .on("mouseout", mouseout);

      isl.style("fill", function(d) {

        var mapCode = d.properties.code;
        var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
        var dataProv = weekData[curProvKey];
        // Actualizar el valor
        d.properties.value = dataProv[curCriteri()];

        var value = d.properties.value;
        if (value) {
          return getColor(value);
        } else {
          return "#ccc";
        }

      });

      // Events per canàries
      isl
        .on("mousemove", function(d) {
          provMouseMove(d);
        })
        .on("mouseout", function() {
          return div.style("opacity", 0);
        })
        .on("mouseout", mouseout);
       maxMin(index);
    }

    maxMin(aux);

      function maxMin(index) {
        var curWeekKey = Object.keys(dJson)[index];
        var weekData = dJson[curWeekKey];
        var max = 0
        var min = 999999999;
        var provMax = '';
        var provMin = '';
        var total = 0;

        for (const wdi in weekData) {
          var entry = weekData[wdi];
          var val = entry[curCriteri()];
          total += val;
          if (entry[curCriteri()] > max) {
            max = val;
            provMax = entry.province;
          }
          if (entry[curCriteri()] < min) {
            min = val;
            provMin = entry.province;
          }
        }
        document.getElementById('maximo').innerHTML = `${provMax}: <b>${addComas(max)}</b>`;
        document.getElementById('minimo').innerHTML = `${provMin}: <b>${addComas(min)}</b>`;
        document.getElementById('mitja_nacional').innerHTML = addComas(total / 52);
      }

      ////////////////////////////////
      // Init:
      ////////////////////////////////
      d3.select("#criteri").on('change', function () {
        // console.log(this.value)
        refreshLeyenda();
        drawMap(aux)
      })

      d3.select("#grafica-close").on('click', function () {
        document.getElementById('grafica').style.display = 'none';
      })
      d3.select("#grafica-close-creueta").on('click', function () {
        document.getElementById('grafica').style.display = 'none';
      })

      refreshLeyenda();
      drawMap(aux)

    });
  });
});

d3.select("#wrapper").on("touchstart", function() {
  div
    .transition()
    .duration(100)
    .style("opacity", 0);
});
