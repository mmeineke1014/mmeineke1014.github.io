console.log("Enter Main")
let data, correlationGraph, distribution_1, distribution_2, map_1, map_2, attribute1, attribute2, color1, color2

let getColors = (attribute) =>{
    let colors = new Object;

    if(["percent_inactive", "percent_smoking", "percent_high_blood_pressure", "percent_coronary_heart_disease", 
        "percent_stroke", "percent_high_cholesterol"].includes(attribute)){
        colors.attr1 = ["#f7dfe5", "#c10032"];
        colors.attr2 = ["#f7dfef", "#c1007e"]
    }
    else if(["number_of_hospitals", "number_of_primary_care_physicians", "percent_no_heath_insurance"].includes(attribute)){
        colors.attr1 = ["#f7f2df", "#c19500"];
        colors.attr2 = ["#f7eedf", "#c17400"];
    }
    else if(["poverty_perc", "median_household_income", "education_less_than_high_school_percent",
             "elderly_percentage"].includes(attribute)){
        colors.attr1 = ["#dfeef3", "#00789c"];
        colors.attr2 = ["#e7ebf6", "#3e5fb7"];            
    }
    else if(["air_quality", "park_access"].includes(attribute)){
        colors.attr1 = ["#e6f5e6", "#3ab03a"];
        colors.attr2 = ["#f0f5df", "#89b300"];
    }
    else{
        colors.attr1 = ["#D1CF79", "#D1927A", "#79D1C2", "#A079D1"];
        colors.attr2 = ["#D1CF79", "#D1927A", "#79D1C2", "#A079D1"];
    }

    return colors;
};

let setData = (geoData, attribute1, attribute2) => {
    geoData.objects.counties.geometries.forEach(d =>{
        if(d.properties[attribute1] != -1){d.properties.attr1 = d.properties[attribute1];}
        if(d.properties[attribute2] != -1){d.properties.attr2 = d.properties[attribute2];}
    });
};

Promise.all(
    [
        d3.csv('data/national_health_data.csv'),
        d3.json('data/counties-10m.json')
    ]).then( data => {
        const countyData = data[0];
        const geoData = data[1];

        attribute1 = document.getElementById("Attr1Choice").value;
        attribute2 = document.getElementById("Attr2Choice").value;

        console.log(attribute1, attribute2);

        console.log("DATA READ");

        //Combine the datasets

        geoData.objects.counties.geometries.forEach(d => {
            for (let i = 0; i < countyData.length; i++) {
              if (d.id === countyData[i].cnty_fips) {
                d.properties.poverty_perc = +countyData[i].poverty_perc;
                d.properties.median_household_income = +countyData[i].median_household_income;
                d.properties.education_less_than_high_school_percent = +countyData[i].education_less_than_high_school_percent;
                d.properties.air_quality = +countyData[i].air_quality;
                d.properties.park_access = +countyData[i].park_access;
                d.properties.percent_inactive = +countyData[i].percent_inactive;
                d.properties.percent_smoking = +countyData[i].percent_smoking;
                d.properties.elderly_percentage = +countyData[i].elderly_percentage;
                d.properties.number_of_hospitals = +countyData[i].number_of_hospitals;
                d.properties.number_of_primary_care_physicians = +countyData[i].number_of_primary_care_physicians;
                d.properties.percent_no_heath_insurance = +countyData[i].percent_no_heath_insurance;
                d.properties.percent_high_blood_pressure = +countyData[i].percent_high_blood_pressure;
                d.properties.percent_coronary_heart_disease = +countyData[i].percent_coronary_heart_disease;
                d.properties.percent_stroke = +countyData[i].percent_stroke;
                d.properties.percent_high_cholesterol = +countyData[i].percent_high_cholesterol;
                d.properties.urban_rural_status = countyData[i].urban_rural_status;
              }
        
            }
          });

        console.log(geoData);

        color1 = getColors(attribute1);
        color2 = getColors(attribute2);

        //DECLARE GRAPHS
        correlationGraph = new Scatterplot({
            'parentElement': '#correlation',
            'containerHeight': 300,
            'containerWidth': 350
        }, geoData, [attribute1, attribute2]);

        distribution_1 = new Histogram({
            'parentElement': '#distribution_1',
            'containerHeight': 300,
            'containerWidth': 500
        }, geoData, attribute1, color1.attr1[1]);

        distribution_2 = new Histogram({
            'parentElement': '#distribution_2',
            'containerHeight': 300,
            'containerWidth': 500
        }, geoData, attribute2, color2.attr2[1]);

        map_1 = new MapView({
            'parentElement': '#map_1',
            'containerHeight': 400,
            'containerWidth': 650
        }, geoData, attribute1, color1.attr1);

        map_2 = new MapView({
            'parentElement': '#map_2',
            'containerHeight': 400,
            'containerWidth': 650
        }, geoData, attribute2, color2.attr2);


    }).catch(error => {
        console.log(error);  
    });


    document.getElementById("Attr1Choice").addEventListener("change", onAttr1Change);
    document.getElementById("Attr2Choice").addEventListener("change", onAttr2Change);

    function onAttr1Change(){
        console.log("ATTRIBUTE 1 EVENT TRIGGERED");
        //update the attribute and color values
        attribute1 = document.getElementById("Attr1Choice").value;
        color1 = getColors(attribute1);

        //Update the Scatterplot
        correlationGraph.categories = [attribute1, attribute2];
        correlationGraph.updateVis();

        //Update the Histogram
        distribution_1.category = attribute1;
        distribution_1.color = color1.attr1[1];
        distribution_1.updateVis();

        //Update the map
        map_1.category = attribute1;
        map_1.colors = color1.attr1;
        map_1.updateVis();
    };

    function onAttr2Change(){
        console.log("ATTRIBUTE 2 EVENT TRIGGERED");

        attribute2 = document.getElementById("Attr2Choice").value;
        color2 = getColors(attribute2);

        //Update the Scatterplot
        correlationGraph.categories = [attribute1, attribute2];
        correlationGraph.updateVis();

        //Update the Histogram
        distribution_2.category = attribute2;
        distribution_2.color = color2.attr2[1];
        distribution_2.updateVis();

        //Update the map
        map_2.category = attribute2;
        map_2.colors = color2.attr2;
        map_2.updateVis();
    };