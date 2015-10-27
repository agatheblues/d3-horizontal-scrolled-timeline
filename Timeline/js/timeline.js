var dataset = [
	{
	 "section": "diploma",
	 "events": [
	    {
            "debutDate": 2009,
            "endDate": 2009,
            "name": "Baccalaureat",
            "description": "High School Diploma"
        },
	    {
            "debutDate": 2014,
            "endDate": 2014,
            "name": "Master of Science in IT & Telecommunications",
            "description": "Specialisation in Audiovisual and Multimedia Project Management (P.A.M.)"
        }
	  ]
    },
    {
	 "section": "studies",
	 "events": [
	    {
            "debutDate": 2009,
            "endDate": 2011,
            "name": "MPSI / MP",
            "description": "Classes preparing for entrance examinations to the French Grandes Ecoles"
        },
	    {
            "debutDate": 2011,
            "endDate": 2014,
            "name": "Telecom SudParis",
            "description": "Engineering School"
        }
	  ]
    },
];

//Width and height
var gapYears = 150; //Space between two years in px
var w = 1100;
var h = 4 * gapYears; //TODO Replace 4 per number of events in dataset
var sectionNames = [];
var marginAroundTimeline = 30;
var minYear = d3.min(dataset, function(d){
	return d3.min(d.events,function(k){return k.debutDate;});
});
var maxYear = d3.max(dataset, function(d){
	return d3.max(d.events,function(k){return k.endDate;});
});

dataset.forEach(function(item){
	sectionNames.push(item.section);
});

//Create SVG element
var svg = d3.select('#chart')
					.append("svg")
					.attr("width", w)
					.attr("height", h);

/**** Vertical timeline ****/
var timeline = svg.append('g')
					.attr("id","timeline");

//Create scale Y function
var yScale = d3.scale.linear()
					 .domain([minYear, maxYear])
					 .range([0,h]);

//Define Y axis
var yAxisDef = d3.svg.axis()
				  .scale(yScale)
				  .orient("left")
				  .ticks(maxYear-minYear-1)
				  .tickSize(0) 					// No tick visible
				  .tickPadding(15)				// Padding for the label
				  .tickFormat(d3.format("d"));	// Remove comma for thousands (2,010)

//Create Y axis
var yAxis = timeline.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + w/2 + ",0)")
				.call(yAxisDef);

var ticks = yAxis.selectAll(".tick");
	ticks.each(function() {
		d3.select(this).append("circle").attr("r", 10);
	});

/**** Section and events containers, binding****/
var sectionContainer = svg.selectAll('g.section')
							.data(dataset)
							.enter()
							.append('g')
							.attr('class','section')
							.attr('id',function(d){return d.section;});

/**** Add texts ****/
var eventsContainer = svg.selectAll('g.section').selectAll('g.events')
													.data(function(d){return d.events;});

									eventsContainer.enter()
													.append('g')
													.attr('class','events')
													.attr('id',function(d,i){return i;})
													.attr('transform',function(d){
														//If section index is pair, goes to the left of the timeline
														//If section index is even; goes to the right of the timeline
														var index = sectionNames.indexOf(d3.select(this.parentNode).datum().section); //Section index
														if (index % 2 === 0) {
															return 'translate('+ (w/2 - 2*marginAroundTimeline) +','+ yScale(d.debutDate) +')';}
														else {
															return 'translate('+ (w/2 + marginAroundTimeline) +','+ yScale(d.debutDate) +')';
														}
													})
													.attr('text-anchor',function(d){
														//If section index is pair, goes to the left of the timeline
														//If section index is even; goes to the right of the timeline
														var index = sectionNames.indexOf(d3.select(this.parentNode).datum().section); //Section index
														if (index % 2 === 0) {
															return 'end';}
														else {
															return 'start';
														}
													});

									eventsContainer.append('text')
													.attr('class','name')
													.text(function(d){return d.name;});

									eventsContainer.append('text')
													.attr('class','description')
													.text(function(d){return d.description;})
													.attr('transform','translate(0,30)');
