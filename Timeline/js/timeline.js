
	var dataset = [2009,2009,2012,2015,2013];
	var minYear = d3.min(dataset, function(d){ return d; });
	var maxYear = d3.max(dataset, function(d){ return d;});
	//Width and height
	var gapYears = 150; //Space between two years in px
	var w = 800;
	var h = dataset.length * gapYears;

	//Create scale X function
	var yScale = d3.scale.linear()
						 .domain([minYear, maxYear])
						 .range([0,h]);

	//Define X axis
	var yAxisDef = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(maxYear-minYear-1)
					  .tickSize(0) 					// No tick visible
					  .tickPadding(15)				// Padding for the label
					  .tickFormat(d3.format("d"));	// Remove comma for thousands (2,010)

	//Create SVG element
	var timeline = d3.select('#chart')
						.append("svg")
						.attr("id","timeline")
						.attr("width", w)
						.attr("height", h);

	//Create Y axis
	var yAxis = timeline.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + w/2 + ",0)")
					.call(yAxisDef);

	var ticks = yAxis.selectAll(".tick");
		ticks.each(function() {
			d3.select(this).append("circle").attr("r", 10);
		});
