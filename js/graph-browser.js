//$(document).ready(function(){

	function getRelations( currentEndpoint, currentQuery ){	
	    $.ajax({
	        dataType: 'jsonp',
	        jsonp: 'callback',
	        url: currentEndpoint,
	        async: false,
	        data: {
	          format: 'application/sparql-results+json',
	          query: currentQuery,
	        },
	        success: function(data){
	        	processData(data)
	        }
	    });
	}        
	
	function processData(data){
	
	var links = [];
	var nodes = {};

    var aux = data.results.bindings;
	
    for(var i=0; i<aux.length; i++){    	    	
    	// Process results from ajax query.

    	//  drawing distinct colors for distinct named graphs.
    	//links[i] =  {source: aux[i].s.value, target: aux[i].o.value, type: "unknown", graph:aux[i].g.value};
    	links[i] =  {source: aux[i].s.value, target: aux[i].o.value, type: aux[i].p.type};
	}
    
    // Just to debug the graph query
    $("#results").append("Retrieved: "+links.length+" results");    	   
    console.log("Retrieved "+links.length+" results");
    
    	// Compute the distinct nodes from the links.
		 links.forEach(function(link) {
		   link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
		   link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
		 });

		 var w = 600,
		     h = 300;
		// start
		// stop
		// resume
		 var force = d3.layout.force()
		     .nodes(d3.values(nodes))
		     .links(links)
		     .size([w, h])
		     .linkDistance(60)
		     .charge(-300)
		     .on("tick", tick).start();

		 var svg = d3.select("#Graph").append("svg:svg")
						     .attr("width", "100%")
						     .attr("height", "100%")
						     .attr("viewBox", "0 0 "+w+" "+h);
		 
		 // Per-type markers, as they don't inherit styles.
		 svg.append("svg:defs").selectAll("marker")
		     .data(["unknown", "subsumes", "points"])
		   .enter().append("svg:marker")
		     .attr("id", String)
		     .attr("viewBox", "0 -5 10 10")
		     .attr("refX", 15)
		     .attr("refY", -1.5)
		     .attr("markerWidth", 6)
		     .attr("markerHeight", 6)
		     .attr("orient", "auto")
		   .append("svg:path")
		     .attr("d", "M0,-5L10,0L0,5");
		
		 // Just a bar showing the distinct graphs 
     	 var color = d3.scale.category20();
		 var graphs = unique($.map(links,function(d) { return d.graph; }));
		var y = d3.scale
			.ordinal()
			.rangePoints([h-100, 100])
			.domain(graphs);
		var rectWidth = 10;
		svg.append("svg:g").selectAll("circle")
	     .data(graphs)
			.enter().append("svg:rect")
			.attr("y", function(d) { return y(d); })
			.attr("width", rectWidth)
			.attr("height", rectWidth)
			.attr("fill", function(d) { return color(d); })				
		svg.append("svg:g").selectAll("text")
	    	.data(graphs)
		.enter().append("svg:text")
			.attr("y", function(d) { return y(d) })
			.style("fill", function(d) { return color(d); })
			.text(function(d) { return d; });
		 
		 var path = svg.append("svg:g").selectAll("path")
		     .data(force.links())
		   .enter().append("svg:path")
		     .attr("class", function(d) { return "link " + d.type; })
   		     .style("fill", function(d) { return color(d.graph); })
		     .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
		
		 var circle = svg.append("svg:g").selectAll("circle")
		     .data(force.nodes())
		   .enter().append("svg:circle")
		     .attr("r", 6)
		     .call(force.drag);	 		 
		
		 var text = svg.append("svg:g").selectAll("g")
		     .data(force.nodes())
		   .enter().append("svg:g");
		
		 // A copy of the text with a thick white stroke for legibility.
		 text.append("svg:text")
		     .attr("x", 8)
		     .attr("y", ".31em")
		     .attr("class", "shadow")
		     .text(function(d) { return d.name; });
		
		 text.append("svg:text")
		     .attr("x", 8)
		     .attr("y", ".31em")
		     .text(function(d) { return d.name; });
		
		 // Use elliptical arc path segments to doubly-encode directionality.
		 function tick() {
		   path.attr("d", function(d) {
		     var dx = d.target.x - d.source.x,
		         dy = d.target.y - d.source.y,
		         dr = Math.sqrt(dx * dx + dy * dy);
		     return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
		   });
		
		   circle.attr("transform", function(d) {
		     return "translate(" + d.x + "," + d.y + ")";
		   });
		
		   text.attr("transform", function(d) {
		     return "translate(" + d.x + "," + d.y + ")";
		   });
		 }
	}
//Perform SPARQL query and add nodes.
//getRelations();
	
	// Construct a Set from a Collection.
	function unique(a){
		a.sort();
		for(var i = 1; i < a.length; ){
			if(a[i-1] == a[i]){
				a.splice(i, 1);
			} else {
				i++;
			}
		}
		return a;
	}
  
//});
