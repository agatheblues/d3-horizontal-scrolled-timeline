//Width and height
var gapYears = 150; //Space between two years in px
var w = 1000;
var h = 450; //TODO Replace 4 per number of events in dataset
var marginAroundTimeline = 80;
var tickPadding = 15;
var betweenEventPadding = 25;
var eventLeftPadding = 5;
var lineTopPadding = 6;
var maxHeight = 100; //event text maximum height
var nameTopPadding = 6;
//Create SVG element
var svg = d3.select('#chart')
					.append("svg")
					.attr("width", w)
					.attr("height", h)
						.append('g')
						.attr('id','mainTimeline');

/**** Vertical timeline ****/
var timeline = d3.select('g#mainTimeline').append('g')
											.attr("id","timeline");
//Create Y axis
var yAxis = timeline.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate("+ marginAroundTimeline + ","+ h/2 +")");

function update(dataset){
	//Calculate min and max year for a given section
	var minYear = d3.min(dataset, function(d){
		return d3.min(d.events,function(k){return k.debutDate;});
	});
	var maxYear = d3.max(dataset, function(d){
		return d3.max(d.events,function(k){return k.endDate;});
	});

	//Store all the dates for a given section
	var timelineDates = [];
	var countDates = minYear;
	while (countDates  <= maxYear+1) {
		timelineDates.push(countDates);
		countDates++;
	}

	var eventWidth = w/timelineDates.length-betweenEventPadding; //equivalent of yScale.rangeBand (that is equal to 0 here so cannot use)
	var nameTopArray = []; //Store name height at the bottom
	var descriptionBottomArray = []; //Store description height at the top
	var nameBottomArray = []; //Store name height at the bottom
	var descriptionTopArray = []; //Store description height at the top
	var sectionNames = []; //Store section names
	dataset.forEach(function(item){
		sectionNames.push(item.section);
	});


	//scale
	var yScale = d3.scale.ordinal()
						 .domain(timelineDates)
						 .rangeRoundBands([0,w-2*marginAroundTimeline],1,0);

	//Define Y axis
	var yAxisDef = d3.svg.axis()
					  .scale(yScale)
					  .orient("bottom")
					  .tickSize(0) 					// No tick visible
					  .tickPadding(tickPadding)				// Padding for the label
					  .tickFormat(d3.format("d"));	// Remove comma for thousands (2,010)


	yAxis.transition()
		.duration(1000)
		.call(yAxisDef);

	var ticks = yAxis.selectAll(".tick");
		ticks.each(function() {
			d3.select(this).append("circle").attr("r", 7);
		});


	/**** Section container ****/

	var sectionContainer = d3.select('g#mainTimeline').selectAll('g.section')
											.data(dataset);

				sectionContainer.enter()
								.append('g')
								.attr('class','section');

				sectionContainer.attr('id',function(d){return d.section;});

				sectionContainer.exit()
								.remove();

	/**** Events container ****/

	var eventsContainer = d3.select('g#mainTimeline').selectAll('g.section').selectAll('g.events')
														.data(function(d){return d.events;});

										eventsContainer.enter()
														.append('g')
														.attr('class','events')
														.attr('width',eventWidth);

										eventsContainer.attr('id',function(d,i){return i;})
														.attr('text-anchor',function(d){
															if (d.debutDate === minYear) {
																return 'start';
															}
														});

										eventsContainer.exit()
														.remove();




/*** Add events names ***/
	var names = eventsContainer.selectAll('text.name')
											.data(function(d){return [d.name];});

						names.enter()
					 				.append('text')
									.attr('class','name');

						names.text(function(d){return d;})
								.attr('opacity',0)
								.attr('y',function(){
									var index = getSectionIndex(this.parentNode,sectionNames); //Section index
									return index % 2 === 0 ? marginAroundTimeline : -marginAroundTimeline;
								})
								.transition()
								.duration(1000)
								.attr('y',0)
								.attr('opacity',1)
								.each(function(d,i){
									//this = <text>name</text>
									//Wrap <text>
									textWrap(d3.select(this),eventWidth);
									//Compute name text height
									var nameHeight = textHeight(d3.select(this));

									//For events in the top (=index odd), push name position up from the event name height
									var index = getSectionIndex(this.parentNode,sectionNames); //Section index
									if (index % 2 === 0) {
										d3.select(this).attr('transform','translate(0,'+ (-nameHeight-nameTopPadding) +')');
										nameTopArray.push(nameHeight);
									} else {
										//Store name height for later, to push description down
										nameBottomArray.push(nameHeight);
									}
								});

						names.exit()
								.remove();

/*** Add events descriptions ***/
	var descriptions = eventsContainer.selectAll('text.description')
											.data(function(d){return [d.description];});

						descriptions.enter()
						 				.append('text')
										.attr('class','description');


						descriptions.text(function(d){return d;})
										.attr('opacity',0)
										.attr('y',function(){
											var index = getSectionIndex(this.parentNode,sectionNames); //Section index
											return index % 2 === 0 ? (marginAroundTimeline-nameTopArray[d3.select(this.parentNode).attr('id')]) : -marginAroundTimeline;
										})
										.transition()
				                        .duration(1000)
										.attr('y',0)
										.attr('opacity',1)
										.each(function(d,i){
											//Wrap <text>
											textWrap(d3.select(this),eventWidth);
											//Compute description text height
											var descriptionHeight = textHeight(d3.select(this));

		  									//For events in the bottom (=index even), push description position down from the event name height
		  									var index = getSectionIndex(this.parentNode,sectionNames); //Section index
		  									if (index % 2 !== 0) {
		  										d3.select(this).attr('transform','translate(0,'+ nameBottomArray[d3.select(this.parentNode).attr('id')] +')');
												descriptionBottomArray.push(descriptionHeight);
		  									} else {
												//Store name height for later, to push description down
												descriptionTopArray.push(descriptionHeight);
											}
										});

						descriptions.exit()
										.remove();

	/** Translate events container to align bottom line and top line***/
	eventsContainer.attr('transform',function(d){
					//If section index is pair, goes to the left of the timeline
					//If section index is even; goes to the right of the timeline
					var index = getSectionIndex(this,sectionNames); //Section index
					if (index % 2 === 0) {//top
						//on x, align with axis tick
						//on y, move to the top and align the description bottom horizontally by substracting the description height
						return 'translate('+ (marginAroundTimeline+yScale(d.debutDate)) +','+ (h/2 - marginAroundTimeline - descriptionTopArray[d3.select(this).attr('id')]) +')';}
					else {//bottom
						//on y; align name horizontally on margin arount timeline
						return 'translate('+ (marginAroundTimeline+yScale(d.debutDate)) +','+ (h/2 + marginAroundTimeline) +')';
					}
				});

	/*** Add events lines ***/
	var eventLines = eventsContainer.selectAll('line.eventLines')
											.data(function(d){return [d.name];}); //d.name to have the correct amount of lines; cannot bind just d

					eventLines.enter()
								.append('line')
								.attr('class','eventLines')
								.attr('x1',0)
								.attr('x2',0);


				/**Lines animation initalisation**/
				eventLines.attr('y1',function(d){ //for animation, on top part, y1 must be originally at the axis level
									var index = getSectionIndex(this.parentNode,sectionNames); //Section index
									if (index % 2 === 0) {//top
										return marginAroundTimeline + descriptionTopArray[d3.select(this.parentNode).attr('id')];
									}
								})
								.attr('y2',function(d){ //for animation, on bottom part, y2 must be originally at the axis level
												var index = getSectionIndex(this.parentNode,sectionNames); //Section index
												if (index % 2 !== 0) {//Bottom
													return -marginAroundTimeline + tickPadding + d3.select('g.tick text').node().getBBox().height; //size of tick texts
												}
								});

				eventLines.transition()
								.duration(1000)
								.attr('y2',function(d){
									var index = getSectionIndex(this.parentNode,sectionNames); //Section index
									if (index % 2 === 0) {//top
										return marginAroundTimeline + descriptionTopArray[d3.select(this.parentNode).attr('id')];
									} else {//bottom
										return nameBottomArray[d3.select(this.parentNode).attr('id')] + descriptionBottomArray[d3.select(this.parentNode).attr('id')] + lineTopPadding;
									}
								})
								.attr('y1',function(d){
												var index = getSectionIndex(this.parentNode,sectionNames); //Section index
												if (index % 2 === 0) {//top
													return (-nameTopArray[d3.select(this.parentNode).attr('id')]-lineTopPadding);
												} else {//bottom
													return -marginAroundTimeline + tickPadding + d3.select('g.tick text').node().getBBox().height; //size of tick texts
												}
								});

					eventLines.exit()
								.remove();
}


update(dataset[0]);

//Count the element in a selection
d3.selection.prototype.size = function() {
var n = 0;
this.each(function() { ++n; });
return n;
};

function textHeight(text){
	//Compute description text height
	var lineHeight = text.select('tspan').attr('dy');
	var lineNumber = text.selectAll('tspan').size();
	return parseFloat(lineHeight) * lineNumber;

}

function textWrap(text,eventWidth){
	//Wrap text
	d3plus.textwrap()
	    .container(text)
	    .shape('square')
	    .width(eventWidth)
	    .height(maxHeight)
		.x(eventLeftPadding)
	    .draw();
}

function getSectionIndex(childNode,sectionNames){
	//find position of the parentNode g.section section attribute in the section names. Return index which is the section index in the dataset.
	return sectionNames.indexOf(d3.select(childNode.parentNode).datum().section);
}
