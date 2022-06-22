function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    //console.log(data);
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector.append("option").text(sample).property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter((sampleObj) => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array.
    var samplesArray = data.samples;
    var metadataArray = data.metadata;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var selectedSample = samplesArray.filter(
      (sampleObj) => sampleObj.id == sample
    );
    //console.log( "Selected sample ID:" );
    //console.log( selectedSample );

    // Gauge - 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var selectedSampleMetadata = metadataArray.filter( 
      (sampleObj) => sampleObj.id == sample 
    );
    //console.log( "Selected Sample Metadata: " );
    //console.log( selectedSampleMetadata );

    //  5. Create a variable that holds the first sample in the array.
    var firstElement = selectedSample[0];
    //console.log("First element Id: " + firstElement.id);

    // Gauge - 2. Create a variable that holds the first sample in the metadata array.
    var firstMetadataElement = selectedSampleMetadata[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = firstElement.otu_ids;
    //console.log(otuIds);

    var otuLabels = firstElement.otu_labels;
    //console.log(otuLabels);

    var otuValues = firstElement.sample_values;
    //console.log(otuValues);

    //Gauge -  3. Create a variable that holds the washing frequency.
    var washingFrequency = firstMetadataElement.wfreq;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order so the otu_ids with the most bacteria are last.

    var yticks = otuIds
      .map(function (id) {
        return "OTU " + id;
      })
      .slice(0, 10)
      .reverse();

    //console.log("yticks: " + yticks);

    // 8. Create the trace for the bar chart.
    var barData = [
      {
        x: otuValues.slice(0, 10).reverse(),
        y: yticks,
        text: otuLabels.slice(0, 10).reverse(),
        type: "bar",
        orientation: "h",
      },
    ];

    // 9. Create the layout for the bar chart.
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
    };

    // 10. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bar", barData, barLayout);

    //Deliverable 2 - Bubble chart
    // 1. Create the trace for the bubble chart.
    //converting Ids to hex strings for colors
    var hexColors = otuIds.map(function (id) {
      return id.toString(16);
    });
    //console.log(hexColors);

    var bubbleData = [
      {
        x: otuIds,
        y: otuValues,
        mode: "markers",
        text: otuLabels,
        marker: {
          //color: otuIds,
          color: hexColors,
          //colorscale: hexColors,
          size: otuValues,
        },
      },
    ];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      showlegend: false,
      xaxis: { title: "OTU ID" },
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // GUAUGE - 4. Create the trace for the gauge chart.
    var gaugeData = [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: washingFrequency,
        title: { text: "<b>Belly Button Wasing Frequency</b><br>Scrubs per week" },
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [1, 10], tickcolor: "Black", tickwidth: 1 },
          bar: { color: "Black" },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "LightGreen" },
            { range: [8, 10], color: "DarkGreen" }
          ]
        }
      }
    ];

    // GUAUGE - 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      title: { title: "Scrubs per week" },
    };

    // GUAUGE -  6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot( "gauge", gaugeData, gaugeLayout);
  });
}
