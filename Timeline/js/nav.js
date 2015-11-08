
//Menu container
var menuContainer = d3.select('div#chart').select('svg')
											.append('g')
											.attr('id','menuContainer');

//menu circles items
var menuCircles = menuContainer.selectAll('circle').data(dataset);

	menuCircles.enter()
					.append('circle')
					.attr('class',function(d,i){
						return i === 0 ? 'marker active' : 'marker';
					})
					.attr('r',4)
					.attr('cx',w-15);

	menuCircles.attr('id',function(d,i){return 'marker'+i;})
				.attr('cy',function(d,i){return h/3+i*15;});

	menuCircles.exit()
				.remove();

//on click; go to next and get active class

var updateMarker = function(newMarker,i){
	menuContainer.selectAll('circle.marker').attr('class','marker');
	newMarker.attr('class','marker active');
	update(dataset[i]);
};

menuContainer.selectAll('circle.marker')
				.on('click',function(d,i){
					updateMarker(d3.select(this),i);
				});

/*/ Scroll handler */
var i = 0;
var compteur = 0;
var n = dataset.length;
var scrollLimit = 170;


window.addEventListener("wheel", function(e){
	compteur += e.deltaY;

	if (compteur < 0) {
		compteur = 0;
	}

	if (compteur > n*scrollLimit) {
		compteur = n*scrollLimit;
	}

	//From i to i+1; From i to i-1
	if (compteur > (i+1)*scrollLimit && i!=n-1) {
		update(dataset[++i]); //Change dataset
		updateMarker(d3.select('#marker'+i),i); //change marker on menu nav
	} else if (compteur < i*scrollLimit && i!=0) {
		update(dataset[--i]);
		updateMarker(d3.select('#marker'+i),i);
	}


});
