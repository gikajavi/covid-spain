function addComas(n) {
  var formatValue = d3.format("0,000");
  return formatValue(n)
    .replace(".", ",")
    .replace(".", ",");
}
var colores = new Array("#ECC5B4", "#E3A78F", "#D9886C", "#D0694C", "#A55036");

function getColor(d) {
  return d > 40
    ? colores[4]
    : d > 30
    ? colores[3]
    : d > 20
    ? colores[2]
    : d > 10
    ? colores[1]
    : colores[0];
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


// d3.select("#year").html(trimestres[trimestres.length - 1].substring(0, 4));

var height = 330,
  width = 885,
  trans = 60;
var w = 950,
  h = 380;
var aux = 62;
var width_slider = 920;
var height_slider = 50;

var historicoUrl = 'https://www.luissevillano.net/historical-evolution-of-the-unemployment-rate-in-spain/data/historico.csv';
var provinciasUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/Provincias.json';
var canarianUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/canarian.json';
var datosUrl = 'https://raw.githubusercontent.com/gikajavi/covid-spain/main/datos_semana_agregados.json';



var dJson = {}
// Cargar nuestro JSON con los datos
d3.json(datosUrl, function(data) {
  dJson = data;
})


d3.csv(historicoUrl, function(data) {
  d3.json(provinciasUrl, function(json) {
    d3.json(canarianUrl, function(can) {

      /* ------SLIDER----- */
      var svg = d3
        .select("#slider")
        .attr("class", "chart")
        .append("svg")
        .attr("width", width_slider)
        .attr("height", height_slider);

      // var axisyears = [
      //   parseFloat(trimestres[0].substring(0, 4)),
      //   parseFloat(trimestres[0].substring(0, 4)),
      //   parseFloat(trimestres[0].substring(0, 4)),
      //   parseFloat(trimestres[trimestres.length - 1].substring(0, 4))
      // ];

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

      // Nova escala
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
        // console.log(d)
        // alert('TODO: Dibujar el histograma!!');
        // https://observablehq.com/@d3/histogram
        // https://www.d3-graph-gallery.com/graph/histogram_basic.html
      }


      function mouseover(d) {
        return ;


        d3.select(this)
          .attr("stroke-width", "1px")
          .attr("fill-opacity", "0.9");
        div.style("opacity", 0.9);
        div.html(
          "<b>" +
            d.properties.name +
            "</b></br>Tasa paro: <b>" +
            addComas(data[d.properties.code][trimestres[aux]]) +
            "%</b> <br>" +
            d.properties.comunidad
        );
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
      //maxMin(data, aux);
      function drawMap(index) {
        curWeekFrom = Object.keys(dJson)[index-1];
        if (!curWeekFrom)
          curWeekFrom = '2020-02-28'
        curWeekTo = Object.keys(dJson)[index];
        d3.select("#year").html(curWeekFrom + '..' + curWeekTo);

        // Setmana seleccionada
        var curWeekKey = Object.keys(dJson)[index];
        var weekData = dJson[curWeekKey];

        cont.style("fill", function(d) {

          var mapCode = d.properties.code;
          var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
          var dataProv = weekData[curProvKey];
          // Actualizar el valor
          d.properties.value = dataProv['num_casos2'];

          var value = d.properties.value;
          if (value) {
            return getColor(value);
          } else {
            return "#ccc";
          }

        });


        cont
          .on("mousemove", function(d) {
            var mapCode = d.properties.code;
            var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
            var dataProv = weekData[curProvKey];

            div.style("opacity", 0.9);
            div
              .html(
                "<pre>" +
                  JSON.stringify(dataProv, null, 2) +
                  "</pre> <br>"
              )
              .style("left", function() {
                if (d3.event.pageX > 780) {
                  return d3.event.pageX - 180 + "px";
                } else {
                  return d3.event.pageX + 23 + "px";
                }
              })
              .style("top", d3.event.pageY - 20 + "px");
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
          d.properties.value = dataProv['num_casos2'];

          var value = d.properties.value;
          if (value) {
            return getColor(value);
          } else {
            return "#ccc";
          }

          //
          // for (var i = 0; i < data.length; i++) {
          //   var codeState = data[i].code;
          //   var dataValue = data[i][trimestres[index]];
          //   for (var j = 0; j < can.features.length; j++) {
          //     var jsonState = can.features[j].properties.code;
          //     if (codeState == jsonState) {
          //       can.features[j].properties.value = dataValue;
          //       break;
          //     }
          //   }
          // }
          // var value = d.properties.value;
          // if (value) {
          //   return getColor(value);
          // } else {
          //   return "#ccc";
          // }


        });


        isl
          .on("mousemove", function(d) {

            var mapCode = d.properties.code;
            var curProvKey = parseInt(Object.keys(weekData)[mapCode]);
            var dataProv = weekData[curProvKey];

            div.style("opacity", 0.9);
            div
                .html(
                    "<pre>" +
                    JSON.stringify(dataProv, null, 2) +
                    "</pre> <br>"
                )

              .style("left", function() {
                if (d3.event.pageX > 780) {
                  return d3.event.pageX - 180 + "px";
                } else {
                  return d3.event.pageX + 23 + "px";
                }
              })
              .style("top", d3.event.pageY - 20 + "px");
          })
          .on("mouseout", function() {
            return div.style("opacity", 0);
          })
          .on("mouseout", mouseout);
        maxMin(data, index);
      }
      maxMin(data, aux);



      function maxMin(d, index) {
        // TODO: Trobar, per la setmana seleccionada, el max i el mínim del concepte a que ens estem referint
        return null;



        d3.select("#minimoParo").html("");
        d3.select("#maximoParo").html("");
        d3.select("#mediaParo").html("");
        var datos = [];
        var provincia = [];
        for (var i = 0; i < data.length - 1; i++) {
          //-1 para que no cargue Nacional
          datos.push(d[i][trimestres[index]]);
          provincia.push(d[i].state);
        }
        var max_min = d3.extent(datos);
        // console.log(max_min);
        var provinciaMax;
        var provinciaMin;
        for (var j = 0; j < data.length - 1; j++) {
          if (max_min[0] == datos[j]) {
            provinciaMin = provincia[j];
          }
          if (max_min[1] == datos[j]) {
            provinciaMax = provincia[j];
          }
        }
        var nombreMediaParo = d3
          .select("#mediaParo")
          .html(addComas(data[52][trimestres[index]]) + "%");
        var nombreProvinciaMax = d3
          .select("#maximoParo")
          .html(
            addComas(max_min[1]) +
              "%<br>" +
              "<span id='provincia'>" +
              provinciaMax +
              "</span>"
          );
        var nombreProvinciaMin = d3
          .select("#minimoParo")
          .html(
            addComas(max_min[0]) +
              "%<br>" +
              "<span id='provincia'>" +
              provinciaMin +
              "</span"
          );
      }


      ////////////////////////////////
      // Init:
      ////////////////////////////////
      drawMap(62)

    });
  });
});

d3.select("#wrapper").on("touchstart", function() {
  div
    .transition()
    .duration(100)
    .style("opacity", 0);
});
