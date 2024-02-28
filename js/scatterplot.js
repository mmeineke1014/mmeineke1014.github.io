class Scatterplot {
    constructor(_config, _data, _categories ){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 750,
            containerHeight: _config.containerHeight || 500,
            margin: {top: 10, right: 50, bottom: 40, left: 50},
            tooltipPadding: _config.tooltipPadding || 15  
        }

        this.data = _data;
        this.categories = _categories;

        console.log(this.categories);

        this.initVis();
    }

    initVis(){
        console.log('Draw Scatterplot');

        let vis = this;

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Define 'svg' as a child-element (g) from the drawing area and include spaces
        // Add <svg> element (drawing space)
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .domain([0,1])
            .range([0,1]);

        vis.yScale = d3.scaleLinear()
            .domain([0,1])
            .range([0,1]);

        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr("transform", "translate(0," + vis.height + ")") 
            .call(d3.axisBottom(vis.xScale));

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .call(d3.axisLeft(vis.yScale));
 
        vis.xAxisLabel = vis.chart.append('text')
            .attr('class', 'x label')
            .attr("text-anchor", "end")
            .attr("x", vis.width/2 + vis.config.margin.left)
            .attr("y", vis.height + vis.config.margin.top + 20)
            .text(vis.categories[1]);

        vis.yAxisLabel = vis.chart.append('text')
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -vis.config.margin.left + 20)
            .attr("x", -vis.config.margin.top - vis.height/2 + 20)
            .attr("transform", "rotate(-90)")
            .text(vis.categories[0]);

        vis.updateVis();

    }


    updateVis(){
        let vis = this;
        
        vis.xAxisGroup.remove();
        vis.yAxisGroup.remove();
        vis.xAxisLabel.remove();
        vis.yAxisLabel.remove();

        //Define the graph scaless
        //get the Max and Min values for the x and y data
        if(vis.categories.includes("urban_rural_status")){
            if(vis.categories[0] == "urban_rural_status"){
                const xMax = d3.max(vis.data.objects.counties.geometries, d => d.properties[vis.categories[1]]) * 1.075;
                console.log("xMax", xMax);

                vis.yScale = d3.scaleBand()
                                    .domain(["Rural", "Suburban", "Small City", "Urban"])
                                    .range([0, vis.width])
                                    .paddingInner(0.1);
                
                if(vis.categories[1] == "urban_rural_status"){
                    vis.xScale = d3.scaleBand()
                    .domain(["Rural", "Suburban", "Small City", "Urban"])
                    .range([0, vis.width])
                    .paddingInner(0.1);
                }
                else{
                    vis.xScale = d3.scaleLinear()
                    .domain([0, xMax])
                    .range([vis.height, 0]);
                }
            }
            else{
                const yMax = d3.max(vis.data.objects.counties.geometries, d => d.properties[vis.categories[0]]) * 1.075;

                vis.yScale = d3.scaleLinear()
                    .domain([yMax, 0])
                    .range([0, vis.width]);
    
                vis.xScale = d3.scaleBand()
                                    .domain(["Rural", "Suburban", "Small City", "Urban"])
                                    .range([0, vis.width])
                                    .paddingInner(0.1);
            }
        }
        else{
            const xMax = d3.max(vis.data.objects.counties.geometries, d => d.properties[vis.categories[1]]);
            const yMax = d3.max(vis.data.objects.counties.geometries, d => d.properties[vis.categories[0]]);            

            let scaleMax = 100;

            if(Math.abs(xMax - yMax) < 20){
                if(xMax >= yMax){
                    scaleMax = xMax * 1.075;
                }
                else{
                    scaleMax = yMax * 1.075;
                }
        
                vis.xScale = d3.scaleLinear()
                    .domain([0, scaleMax])
                    .range([0, vis.width]);
        
                vis.yScale = d3.scaleLinear()
                    .domain([scaleMax, 0])
                    .range([0, vis.height]);
            }
            else{
                vis.xScale = d3.scaleLinear()
                    .domain([0, (xMax * 1.075 )])
                    .range([0, vis.width]);
    
                vis.yScale = d3.scaleLinear()
                    .domain([(yMax * 1.075), 0])
                    .range([0, vis.height]);
            }
        }


        //Draw the Axes
        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr("transform", "translate(0," + vis.height + ")") 
            .call(d3.axisBottom(vis.xScale));

        //Adjust for longer labels
        if(["median_household_income"].includes(vis.categories[1])){
            vis.xAxisGroup.selectAll("text")
                    .attr('transform', 'rotate(25)');
        }

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .call(d3.axisLeft(vis.yScale))

        //Adjust for the longer labels
        if(["median_household_income", "urban_rural_status"].includes(vis.categories[0])){
            vis.yAxisGroup.selectAll("text")
                    .attr('transform', 'rotate(-65)');
        }

            
        // Label the Axes
        vis.xAxisLabel = vis.chart.append('text')
            .attr('class', 'x label')
            .attr("text-anchor", "end")
            .attr("x", vis.width/1.5 + vis.config.margin.left)
            .attr("y", vis.height + vis.config.margin.top + 20)
            .text(vis.categories[1]);

        vis.yAxisLabel = vis.chart.append('text')
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -vis.config.margin.left + 20)
            .attr("x", -vis.config.margin.top - vis.height/3 + 20)
            .attr("transform", "rotate(-90)")
            .text(vis.categories[0]);



        //Plot the Data on the chart
        vis.circles = vis.chart.selectAll('circle')
            .data(vis.data.objects.counties.geometries)
        .join('circle')
            .attr('fill', d =>{
                if(d.properties[vis.categories[1]] != -1 && d.properties[vis.categories[0]] != -1
                    && d.properties[vis.categories[1]] && d.properties[vis.categories[0]]){
                    return 'black';
                }
                else{
                    return 'none';
                }
            })
            .attr('r', 3)
            .attr('cy', (d) => {
                if(vis.categories[0] == "urban_rural_status"){
                    return (vis.yScale(d.properties[vis.categories[0]]) + ( vis.yScale.bandwidth() / 2));
                }
                else{
                    return vis.yScale(d.properties[vis.categories[0]]);

                }}) 
            .attr('cx', (d) =>  {
                if(vis.categories[1] == "urban_rural_status"){
                    return (vis.xScale(d.properties[vis.categories[1]]) + ( vis.xScale.bandwidth() / 2));
                }
                else{
                    return vis.xScale(d.properties[vis.categories[1]]);
                }});

        vis.circles
          .on('mouseover', (event, d) => {
            console.log("mouse over! ");
            console.log(event);
            console.log(d);
          
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
                <div class="tooltip-title">${d.properties.name}</div>
                <ul>
                    <li>${vis.categories[1]}: ${d.properties[vis.categories[1]]}</li>
                    <li>${vis.categories[0]}: ${d.properties[vis.categories[0]]}</li>
                </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

    }

    renderVis(){

    }

}