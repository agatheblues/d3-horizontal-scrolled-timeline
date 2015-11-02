var dataset1 = [
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
            "name": "Master of cooking in Lemon Meringue Pie",
            "description": "Specialisation in cookies and kit kat ball ice-cream"
        }
	  ]
    },
    {
	 "section": "studies",
	 "events": [
	    {
            "debutDate": 2009,
            "endDate": 2011,
            "name": "Cooking",
            "description": "Classes preparing for entrance examinations to the French Cooking School"
        },
	    {
            "debutDate": 2011,
            "endDate": 2014,
            "name": "A la bonne fourchette",
            "description": "Cooking School"
        }
	  ]
    },
];
var dataset2 = [
	{
	 "section": "persoXP",
	 "events": [
	    {
            "debutDate": 2011,
            "endDate": 2014,
            "name": "Private Teaching",
            "description": "One pie a day"
        },
	    {
            "debutDate": 2012,
            "endDate": 2013,
            "name": "President of the pie cooking club",
            "description": "Student association"
        },
	    {
            "debutDate": 2013,
            "endDate": 2014,
            "name": "The longest pie ever",
            "description": "Specialisation Pie Project"
        }
	  ]
    },
    {
	 "section": "proXP",
	 "events": [
	    {
            "debutDate": 2012,
            "endDate": 2012,
            "name": "Internship at La bonne auberge",
            "description": "Restaurant hosting"
        },
	    {
            "debutDate": 2013,
            "endDate": 2013,
            "name": "Internship at La bonne tarte",
            "description": "Responsible of the croissants"
        },
	    {
            "debutDate": 2014,
            "endDate": 2014,
            "name": "Internship at Le bon gateau",
            "description": "The perfect pie"
        }
	  ]
    },
];
//Width and height
var gapYears = 150; //Space between two years in px
var w = 1100;
var h = 3.5 * gapYears; //TODO Replace 4 per number of events in dataset
var marginAroundTimeline = 30;

//Create SVG element
var svg = d3.select('#chart')
					.append("svg")
					.attr("width", w)
					.attr("height", h);

/**** Vertical timeline ****/
var timeline = svg.append('g')
					.attr("id","timeline");
//Create Y axis
var yAxis = timeline.append("g")
						.attr("class", "y axis")
						.attr("transform", "translate(" + w/2 + ",0)");

function update(dataset){

	var minYear = d3.min(dataset, function(d){
		return d3.min(d.events,function(k){return k.debutDate;});
	});
	var maxYear = d3.max(dataset, function(d){
		return d3.max(d.events,function(k){return k.endDate;});
	});


	//Create scale Y function
	var yScale = d3.scale.linear()
						 .domain([minYear, maxYear])
						 .range([0,h]);

	//Define Y axis
	var yAxisDef = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(maxYear-minYear)
					  .tickSize(0) 					// No tick visible
					  .tickPadding(15)				// Padding for the label
					  .tickFormat(d3.format("d"));	// Remove comma for thousands (2,010)


	yAxis.transition()
		.duration(1000)
		.call(yAxisDef);

	var ticks = yAxis.selectAll(".tick");
		ticks.each(function() {
			d3.select(this).append("circle").attr("r", 10);
		});

	var sectionNames = [];

	dataset.forEach(function(item){
		sectionNames.push(item.section);
	});

	/**** Section and events containers, binding****/

	var sectionContainer = d3.select('svg').selectAll('g.section')
											.data(dataset);

				sectionContainer.enter()
								.append('g')
								.attr('class','section');

				sectionContainer.attr('id',function(d){return d.section;});

				sectionContainer.exit()
								.remove();

	/**** Add texts ****/
	//svg.selectAll('g.section').selectAll('g.events').remove();

	var eventsContainer = svg.selectAll('g.section').selectAll('g.events')
														.data(function(d){return d.events;});

										eventsContainer.enter()
														.append('g')
														.attr('class','events');

										eventsContainer.attr('id',function(d,i){return i;})
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

										eventsContainer.exit()
														.remove();

var names = eventsContainer.selectAll('text.name')
											.data(function(d){return [d.name];});

						names.enter()
				 				.append('text')
								.attr('class','name');

						names.text(function(d){return d;})
								.attr('opacity',0)
								.transition()
		                        .duration(1000)
								.attr('opacity',1);

						names.exit()
								.remove();

var descriptions = eventsContainer.selectAll('text.description')
											.data(function(d){return [d.description];});

						descriptions.enter()
						 				.append('text')
										.attr('class','description')
										.attr('transform','translate(0,20)');

						descriptions.text(function(d){return d;})
										.attr('opacity',0)
										.transition()
				                        .duration(1000)
										.attr('opacity',1);

						descriptions.exit()
										.remove();
										// eventsContainer.append('text')
										// 				.attr('class','name')
										// 				.text(function(d){return d.name;});

										// eventsContainer.append('text')
										// 				.attr('class','description')
										// 				.attr('transform','translate(0,30)')
										// 				.text(function(d){return d.description;});


}

update(dataset1);
var i = 0;

d3.select('#change').on('click',function(){
	if (i === 0) {
	    update(dataset2);
		i = 1;
	} else {
		update(dataset1);
		i=0;
	}

});

var compteur = 0;
var i = 1;
window.addEventListener("wheel", function(e){
	compteur += e.deltaY;
	console.log(compteur);

	if (compteur > 100 && i!=2) {
		update(dataset2);
		i = 2;
	} else if (compteur < 100 && i!=1){
		update(dataset1);
		i = 1;
	}

});
