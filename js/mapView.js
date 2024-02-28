class MapView {
    constructor(_config, _data, _DataID, _colors ){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 1000,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
            tooltipPadding: 10,
        }

        this.data = _data;
        this.category = _DataID;
        this.colors = _colors;

        this.initVis();
    }

    initVis(){
        console.log("DRAW THE MAP")
        let vis = this;

        // Calculate inner chart size. Margin specifies the space around the actual chart.
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
    
        vis.svg.append('rect')
                .attr('class', 'background center-container')
                .attr('height', vis.config.containerHeight ) //height + margin.top + margin.bottom)
                .attr('width', vis.config.containerWidth) //width + margin.left + margin.right)
                .on('click', vis.clicked);
    
      
        vis.projection = d3.geoAlbersUsa()
                .translate([vis.width / 2, vis.height / 2])
                .scale(vis.width);

      vis.updateVis();
    }


    updateVis(){
      let vis = this;

      const extent = d3.extent(vis.data.objects.counties.geometries, d => d.properties[this.category]);
      console.log(extent);

      if(vis.category == "urban_rural_status"){
        vis.colorScale = d3.scaleOrdinal()
                              .domain(["Rural", "Suburban", "Small City", "Urban"])
                              .range(vis.colors);
      }
      else{
        vis.colorScale = d3.scaleLinear()
                              .domain(extent)
                              .range(vis.colors)
                              .interpolate(d3.interpolateHcl);
      }


  
      vis.path = d3.geoPath()
              .projection(vis.projection);

              vis.g = vis.svg.append("g")
              .attr('class', 'center-container center-items us-state')
              .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
              .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
              .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
  
  
      vis.counties = vis.g.append("g")
                  .attr("id", "counties")
                  .selectAll("path")
                  .data(topojson.feature(vis.data, vis.data.objects.counties).features)
                  .enter().append("path")
                  .attr("d", vis.path)
                  // .attr("class", "county-boundary")
                  .attr('fill', d => {
                        if (d.properties[vis.category] != -1) {
                          return vis.colorScale(d.properties[this.category]);
                        } else {
                          return 'url(#lightstripe)';
                        }
                      });
      vis.counties
                .on('mousemove', (event, d) => {
                  console.log(d);
                  console.log(event);
                  const val = d.properties[vis.category] != -1 ? `${d.properties[vis.category]}` : "No Data Available";
                    d3.select('#tooltip')
                      .style('display', 'block')
                      .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                      .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                      .html(`
                        <div class="tooltip-title">${d.properties.name}</div>
                        <div>${vis.category}: ${val}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'none');
                  });
  
      vis.g.append("path")
                  .datum(topojson.mesh(vis.data, vis.data.objects.states, function(a, b) { return a !== b; }))
                  .attr("id", "state-borders")
                  .attr("d", vis.path);
    }

    renderVis(){

    }

}