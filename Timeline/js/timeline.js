var w = 1200;
var h = 550;
var marginAroundTimeline = 80; 	// Margin between the axis and the events
var radiusAxis = 6; 			// Axis circles radius
var tickPadding = 15; 			// Padding between ticks and dates on the axis
var betweenEventPadding = 25;	// Space between events horizontally
var eventLeftPadding = 5;		// Padding between the vertical line and the event texts
var linePadding = 2;			// Space between the top of the line and the top of the event texts (bottom for events at the bottom)
var maxHeight = 100; 			// Events maximum height
var nameTopPadding = 6;			// For event names at the top part of the timeline, padding to avoid overlap between the name and description

/* Create SVG element */
var svg = d3.select('#chart')
					.append("svg")
					.attr("width", w)
					.attr("height", h)
						.append('g')
						.attr('id','mainTimeline');

/* Timeline Container */
var timeline = d3.select('g#mainTimeline').append('g')
											.attr("id","timeline");

/* Axis container */
var yAxis = timeline.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate("+ marginAroundTimeline + ","+ h/2 +")");

/* Update pattern to go through several datasets */
function update(dataset){
	/* Section names */
	/** We need to store section names so we can compare g.section index name and get the corresponding index position
	Needed in getSectionIndex **/
	var sectionNames = [];
	dataset.forEach(function(item){
		sectionNames.push(item.section);
	});

	/* Axis Creation */
	/** For a given dataset, find minimum debut year and maximum end year over the events **/
	var minYear = d3.min(dataset, function(d){
		return d3.min(d.events,function(k){return k.debutDate;});
	});
	var maxYear = d3.max(dataset, function(d){
		return d3.max(d.events,function(k){return k.endDate;});
	});

	/** Scale definition **/
	var yScale = d3.scale.ordinal()
						 .domain(d3.range(minYear,maxYear+2))					// d3.range doesnt include the stop value so +1. If an event begins on the maxYear, it needs space to be displayed so +1. -> +2
						 .rangeRoundBands([0,w-2*marginAroundTimeline],1,0);	// 1 so the first tick begins on the left edge of the axis

	/** Axis definition **/
	var yAxisDef = d3.svg.axis()
					  .scale(yScale)
					  .orient("bottom")
					  .tickSize(0) 						// No tick visible
					  .tickPadding(tickPadding)			// Padding for the label
					  .tickFormat(d3.format("d"));		// Remove comma for thousands (2,010)

	/** Axis creation and animation **/
	yAxis.transition()
		.duration(1000)
		.call(yAxisDef);

	/** Axis ticks to be circles **/
	var ticks = yAxis.selectAll(".tick");
		ticks.each(function() {
			d3.select(this).append("circle").attr("r", radiusAxis);
		});
	/* End of axis creation */


	/* Section containers */
	/** Binded data : sections names
	Create one <g> per section **/
	var sectionContainer = d3.select('g#mainTimeline').selectAll('g.section')
											.data(dataset);

				sectionContainer.enter()
								.append('g')
								.attr('class','section');

				sectionContainer.attr('id',function(d){return d.section;});

				sectionContainer.exit()
								.remove();

	/*  Events containers */
	/** Binded data : events
	Create one <g> per event, nested under the corresponding section **/
	var eventWidth = w/d3.range(minYear,maxYear+2).length-betweenEventPadding; // Allocated width between events (equivalent of rangeBand, which we can't use here as it is null because rangeRoundBands padding is = 1)

	var eventsContainer = d3.select('g#mainTimeline').selectAll('g.section').selectAll('g.events')
														.data(function(d){return d.events;});

										eventsContainer.enter()
														.append('g')
														.attr('class','events')
														.attr('width',eventWidth);

										eventsContainer.attr('id',function(d,i){return i;});

										eventsContainer.exit()
														.remove();


	/* Events names */
	/** Binded data : events.name
	Create one <text> per events name, nested under the corresponding event **/
	var namesTopArray = []; 		// Store names height, from events at the top of timeline
	var namesBottomArray = []; 		// Store names height, from events at the bottom of timeline

	var names = eventsContainer.selectAll('text.name')
											.data(function(d){return [d.name];}); // [] otherwise it's one data per character

						names.enter()
					 				.append('text')
									.attr('class','name');

						names.text(function(d){return d;})
								.each(function(d,i){
									var currentName = d3.select(this);						//The current <text> element
									textWrap(currentName,eventWidth);						// Wrap text in dedicated width
									var nameHeight = textHeight(currentName);				// Calculate height of the whole <text>

									var index = getSectionIndex(this.parentNode,sectionNames); 	// Get the parent section index to know if the event is in the top part or the bottom part of the timeline
										/*** If the section index is even, the events are on the top part of the timeline.
											Because of the wrap, names and descriptions overlap.
											Names at the top should be translated up, from their own height.
											No need to move names at the bottom. ***/
										if (index % 2 === 0) {
											currentName.attr('transform','translate(0,'+ -(nameHeight + nameTopPadding) +')');
											namesTopArray.push(nameHeight);		// Store name height for later
										} else {
											namesBottomArray.push(nameHeight);	// Store name height for later
										}
								});

						/*** Names animation - Initial to end state ***/
						names.attr('opacity',0)
								.attr('y',function(){
									var index = getSectionIndex(this.parentNode,sectionNames); 				//Section index
									return index % 2 === 0 ? marginAroundTimeline : -marginAroundTimeline;	// If it's a name from the top area, transition goes from the bottom to the top ; and the other way around:
								})
								.transition()
								.duration(1000)
								.attr('y',0)
								.attr('opacity',1);

						names.exit()
								.remove();

	/* Events descriptionss */
	/** Binded data : events.description
	Create one <text> per events description, nested under the corresponding event **/
	var descriptionsTopArray = []; 			// Store descriptions height, from events at the top of timeline
	var descriptionsBottomArray = [];		// Store descriptions height, from events at the bottom of timeline

	var descriptions = eventsContainer.selectAll('text.description')
											.data(function(d){return [d.description];});

						descriptions.enter()
						 				.append('text')
										.attr('class','description');


						descriptions.text(function(d){return d;})
										.each(function(d,i){
											var currentDescription = d3.select(this);				//The current <text> element
											textWrap(currentDescription,eventWidth);				// Wrap text in dedicated width
											var descriptionHeight = textHeight(currentDescription);	// Calculate height of the whole <text>

											var index = getSectionIndex(this.parentNode,sectionNames); // Get the parent section index to know if the event is in the top part or the bottom part of the timeline
												/*** If the section index is odd, the events are on the bottom part of the timeline.
													Because of the wrap, names and descriptions overlap.
													Descriptions at the bottom should be translated down, from the height of the corresponding event name.
													No need to move names. ***/
			  									if (index % 2 !== 0) {
			  										currentDescription.attr('transform','translate(0,'+ namesBottomArray[d3.select(this.parentNode).attr('id')] +')');
													descriptionsBottomArray.push(descriptionHeight);	// Store description height for later
			  									} else {
													descriptionsTopArray.push(descriptionHeight);		// Store description height for later
												}
										});

						/*** Desciprtions animation - Initial to end state ***/
						descriptions.attr('opacity',0)		// If it's a description from the top area, transition goes from the bottom to the top ; and the other way around:
									.attr('y',function(){
										var index = getSectionIndex(this.parentNode,sectionNames); // Get the parent section index to know if the event is in the top part or the bottom part of the timeline
										return index % 2 === 0 ? (marginAroundTimeline-namesTopArray[d3.select(this.parentNode).attr('id')]) : -marginAroundTimeline;
									})
									.transition()
									.duration(1000)
									.attr('y',0)
									.attr('opacity',1);

						descriptions.exit()
										.remove();

	/* Events containers position
	Translate events container to
	- At the top, align description bottom lines
	- At the bottom, align name top lines
	- On both areas, move events Container across the timeline axis to be aligned with their corresponding date */
	eventsContainer.attr('transform',function(d){
						var index = getSectionIndex(this,sectionNames); // Get the parent section index to know if the event is in the top part or the bottom part of the timeline
							if (index % 2 === 0) {
								/** Top
								On x, align with axis tick
								On y, move to the top and align the description bottom horizontally by substracting the description height **/
								return 'translate('+ (marginAroundTimeline+yScale(d.debutDate)) +','+ (h/2 - marginAroundTimeline - descriptionsTopArray[d3.select(this).attr('id')]) +')';}
							else {
								/** Bottom
								On x, align with axis tick
								On y; align name horizontally on margin around timeline **/
								return 'translate('+ (marginAroundTimeline+yScale(d.debutDate)) +','+ (h/2 + marginAroundTimeline) +')';
							}
				});

	/* Events vertical lines */
	var eventLines = eventsContainer.selectAll('line.eventLines')
											.data(function(d){return [d.name];}); 	//d.name to bind with the correct amount of lines; cannot bind just d.

							eventLines.enter()
										.append('line')
										.attr('class','eventLines')
										.attr('x1',0)
										.attr('x2',0);

				/** Lines animation - initalisation **/
				eventLines.attr('y1',function(d){
									var index = getSectionIndex(this.parentNode,sectionNames); 		// If it's a line from the top area, transition goes from the bottom to the top
										if (index % 2 === 0) {
											return marginAroundTimeline + descriptionsTopArray[d3.select(this.parentNode).attr('id')] - tickPadding;
										}
								})
								.attr('y2',function(d){ // If it's a line from the bottom area, transition goes from the top to the bottom
										var index = getSectionIndex(this.parentNode,sectionNames);
											if (index % 2 !== 0) {//Bottom
												return -marginAroundTimeline + tickPadding + d3.select('g.tick text').node().getBBox().height; //size of tick texts
											}
								});

				/** Lines animation - end state **/
				eventLines.transition()
								.duration(1000)
								.attr('y2',function(d){
									var index = getSectionIndex(this.parentNode,sectionNames);
										if (index % 2 === 0) {
											return marginAroundTimeline + descriptionsTopArray[d3.select(this.parentNode).attr('id')] - tickPadding;
										} else {
											return namesBottomArray[d3.select(this.parentNode).attr('id')] + descriptionsBottomArray[d3.select(this.parentNode).attr('id')] + linePadding;
										}
								})
								.attr('y1',function(d){
									var index = getSectionIndex(this.parentNode,sectionNames);
										if (index % 2 === 0) {
											return (-namesTopArray[d3.select(this.parentNode).attr('id')]-linePadding);
										} else {
											return -marginAroundTimeline + tickPadding + d3.select('g.tick text').node().getBBox().height; //size of tick texts
										}
								});

					eventLines.exit()
								.remove();
}

/* First display */
update(dataset[0]);

/* Count the elements in a selection */
d3.selection.prototype.size = function() {
var n = 0;
this.each(function() { ++n; });
return n;
};

/* Calculate text height, given the number of <tspan> and the line height */
function textHeight(text){
	//Compute description text height
	var lineHeight = text.select('tspan').attr('dy');
	var lineNumber = text.selectAll('tspan').size();
	return parseFloat(lineHeight) * lineNumber;

}

/* Wrap <text>, with d3plus */
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

/* childNode argument must be a child node of a <g> element with a 'section' attribute (sectionContainer)
Given this childNode, getSectionIndex find the position of the 'section' attribute (= name of the section) in the sectionnames array.
Return this position. */
function getSectionIndex(childNode,sectionNames){
	return sectionNames.indexOf(d3.select(childNode.parentNode).datum().section);
}
