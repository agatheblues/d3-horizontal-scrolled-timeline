//Width and height
	var w = 800;
	var h = 300;

	var dataset = [2009,2009,2012,2015,2013];
	var minYear = d3.min(dataset, function(d){ return d; });
	var maxYear = d3.max(dataset, function(d){ return d;});

	//Create scale X function
	var xScale = d3.scale.linear()
						 .domain([minYear, maxYear])
						 .range([0,w]);

	//Define X axis
	var xAxisDef = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
					  .ticks(maxYear-minYear-1)
					  .tickSize(0) 					// No tick visible
					  .tickPadding(15)				// Padding for the label
					  .tickFormat(d3.format("d"));	// Remove comma for thousands (2,010)

	//Create SVG element
	var timeline = d3.select("body")
						.append("svg")
						.attr("id","timeline")
						.attr("width", w)
						.attr("height", h);

	//Create X axis
	var xAxis = timeline.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + h/2 + ")")
					.call(xAxisDef);

	var ticks = xAxis.selectAll(".tick");
		ticks.each(function() {
			d3.select(this).append("circle").attr("r", 12);
		});
