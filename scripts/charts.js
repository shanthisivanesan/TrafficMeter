var ts_start='20140101',ts_end='20140110';
var stDate,edDate;
var brush,title,uri,chartDiv;
var modfilter,ecfilter,bpfilter,filterResults="";
var color = d3.scale.ordinal()
    .range(["rgba(11,94,215,.8)", "rgba(245, 143, 8, 0.8)", "rgba(0, 167, 188, 0.8)", "rgba(223, 40, 35, 0.8)", "rgba(153, 44, 150, 0.8)", "rgba(124, 189, 42, 0.8)", "rgba(37, 47, 71, 0.8)","rgba(153, 0, 51, 0.8)", "rgba(153, 51, 51, 0.8)", "rgba(92, 0, 92, 0.8)"]);
var margin = {top: 20, right: 20, bottom: 20, left: 60},
			width = 1000 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;
var filterArea;
var xLabel,yLabel,left,top;
var d,filter,actor="",compareby = "";
var barHeight="40",data,radius="100",pieLabel="Vehicle";
var currentlevel = "1", parameter = "Physicians", outformat, informat, level3filter;

initialize();

function initialize()
{
	clearAll();
	$('#timeslider').html('');
	var now = new Date();	
	stDate = (now.getFullYear())+''+("0" + (now.getMonth() + 1)).slice(-2)+''+ ("0" + now.getDate()).slice(-2);
	edDate = now.getFullYear()+''+("0" + (now.getMonth() + 2)).slice(-2)+''+ ("0" + now.getDate()).slice(-2);
	filterResults="",currentlevel=1;
	timeSlicer(stDate,edDate);
	top=280,left=-400, xLabel = "Traffic",yLabel="Year",chartDiv="#root_RefMonth";
	title="Traffic Volume By Date";
	hbar("data/year.tsv",chartDiv,title,barHeight,left,top,xLabel,yLabel,compareby);
	var radius="120", top = 5,width="510",height="510",left = 1100,chartDiv ="#root_chart",pieLabel="Vehicle";
	pie("data/vehicle.tsv", chartDiv,radius,pieLabel,width,height,left,top,title);
}

function getdateformat(stDate,edDate)
{
	var et = String(edDate).split(" ");
	var st = String(stDate).split(" ");
	if(et.length >2 && st.length >2)
	{
		var months = {Jan: 1,Feb: 2,Mar: 3,Apr: 4,May: 5,Jun: 6,Jul: 7,Aug: 8,Sep: 9,Oct: 10,Nov: 11,Dec: 12};
		stDate = st[3]+("0" + (months[st[1]])).slice(-2) + ("0" + et[2]).slice(-2);
		edDate = et[3]+("0" + (months[et[1]])).slice(-2) + ("0" + et[2]).slice(-2);
	}
}


function timeSlicer(ts_start,ts_end)
{
		width = 950, height = 160;
		var x = d3.time.scale().range([0, width]),
			y = d3.scale.linear().range([height, 0]);

		var parseDate = d3.time.format("%Y%m%d").parse;
		
		ts_start=parseDate(ts_start);
	    ts_end=parseDate(ts_end);

		//Data Population
  		var xAxis = d3.svg.axis().scale(x).orient("bottom"),
			yAxis = d3.svg.axis().scale(y).orient("left");
        brush = d3.svg.brush()
					.x(x)
					.on("brushend", brushended);
		file="data/Traffic.tsv"
        d3.tsv(file, function (error,data) {  
  		if (error) return console.warn(error);       
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d) { return x(d.Date); })
			.y0(height)
			.y1(function(d) { return y(d.Traffic); });

		var svg = d3.select("#timeslider").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(10,0)");
			
		
		svg.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);

		data.forEach(function(d) {
			d.Date = parseDate(d.Date);
			d.Traffic = + d.Traffic;
		});

		x.domain(d3.extent(data.map(function(d) { return d.Date; })));
		y.domain([0, d3.max(data.map(function(d) { return d.Traffic; }))]);

		var zoom = d3.behavior.zoom()
		.center([width / 2, height / 2])
		.scaleExtent([1, 100])
		.y(y)
		.x(x).on("zoom", function(){
			svg.select("path").attr("d", area);
			svg.select(".x.axis").call(xAxis);
		});

		svg.append("path")
			.datum(data)
			.attr("clip-path", "url(#clip)")
			.attr("d", area);
		 
		svg.append("g")
			.attr("class", "x brush")
			.call(brush.extent([ts_start,ts_end]))
			.selectAll("rect")
	        .attr("height",height)
	        .style({
	            "fill": "#69f",
	            "fill-opacity": "0.1"
	        });

		svg.append("g")
			.attr("class", "y axis")

		svg.append("g")
		    .attr("class", "x axis top")
		    .attr("transform", "translate(0," + height + ")")
		    .call(xAxis);		

		svg.append("g")
		    .attr("class", "y axis top")
		    .call(yAxis);

		//Create Y axis label
		svg.append("g")
		    .attr("class", "y axis top")
		    .call(yAxis)
			.append("text")
	        .attr("transform", "rotate(-90)")
	        .attr("y", 0)
	        .attr("x",0 - (height / 2))
	        .attr("dy", "1em")
	        .style("text-anchor", "middle")
	        .text("Traffic");

		svg.call(zoom)
			.attr("transform","scale(1,1)")
			.on("mousedown.zoom", null)
		    .on("touchstart.zoom", null)
		    .on("touchmove.zoom", null)
		    .on("touchend.zoom", null);
		
	});
}
var zoomed =function() {
        var trans = d3.event.translate;
        var scale = d3.event.scale;

        svg.attr("transform",
            "translate(" + trans + ")"
          + " scale(" + scale + ")");
    }

function brushended() {
	  if (!d3.event.sourceEvent) return; // only transition after input
	  var extent0 = brush.extent(),
	      extent1 = extent0.map(d3.time.day.round);
	      stDate = extent1[0];
	      edDate = extent1[1];
	  // if empty when rounded, use floor & ceil instead
	  if (extent1[0] >= extent1[1]) {
	    extent1[0] = d3.time.day.floor(extent0[0]);
	    extent1[1] = d3.time.day.ceil(extent0[1]);
	  }

	   d3.select(this).transition()
	      .call(brush.extent(extent1))
	      .call(brush.event);

		var et = String(edDate).split(" ");
		var st = String(stDate).split(" ");

		if(et.length >2 && st.length >2)
		{
			var months = {Jan: 1,Feb: 2,Mar: 3,Apr: 4,May: 5,Jun: 6,Jul: 7,Aug: 8,Sep: 9,Oct: 10,Nov: 11,Dec: 12};
			stDate = st[3]+("0" + (months[st[1]])).slice(-2) + ("0" + et[2]).slice(-2);
			edDate = et[3]+("0" + (months[et[1]])).slice(-2) + ("0" + et[2]).slice(-2);
		}

		reload(stDate, edDate);
	}

var reload = function(stDate, edDate)
{
	clearAll();
	updateResults(stDate,edDate);
	chartDiv="#root_RefMonth";
	xLabel = "Traffic",yLabel="Date";
	hbar("data/date.tsv",chartDiv,title,barHeight,left,top,xLabel,yLabel,compareby);
	var radius="125", top = 5,width="510",height="510",left = 1100,chartDiv ="#root_chart",pieLabel="Vehicle";
	pie("data/vehicledetails.tsv", chartDiv,radius,pieLabel,width,height,left,top,title);
}

function clearAll()
{
	$('#root_RefMonth').html('');
	$('#root_chart').html('');
}

var updateResults =function(stDate,edDate,filterResults)
{
	if((typeof(stDate)!="undefined") &&(typeof(edDate)!="undefined"))
	{
		var text = "Results for Date Range " + stDate + " to ";
		
	 	if (typeof(filterResults)!="undefined")
	 		$("#results").html( text+' Filter: '+ filterResults); 
	 	else
	 		$("#results").html(text);
	}
}


function pie(file, chartDiv,radius,pieLabel,width,height,left,top,title)
{
	
	left=100,top=150;

	title = "Traffic Volume by Vehicle";
	var total=0;
	d3.tsv(file, function (error,data) {  
  	if (error) return console.warn(error); 
	 data.forEach(function(d) {
            total = total + d.Traffic;
        });
	var arcOver = d3.svg.arc()
        .outerRadius(parseInt(radius)+10);
    d3.select(chartDiv)
	  .append("text")
	  .attr("x", 200)             
	  .attr("y", 10)
	  .attr("text-anchor", "right") 
	  .style("font-size","20px")   
	  .style("font-weight", "bold") 
	  .text(title);

    var vis = d3.select(chartDiv)
        .append("svg:svg")              
        .data([data])                   
            .attr("width", width)           
            .attr("height", height)
            .append("svg:g")               
            .attr("transform", "translate(200,190)");  
    var arc = d3.svg.arc()              
        .outerRadius(radius);
    var pie = d3.layout.pie()          
        .value(function(d) { return d.Traffic; });    
    var arcs = vis.selectAll("g.slice")     
        .data(pie)                          
        .enter()                            
            .append("svg:g")               
                .attr("class", "slice") 
				.on("mouseover", function (d, i) {
					   d3.select(this).select("path").transition()
		               .duration(500)
		               .attr("d", arcOver);
                      $("#tooltip")
                        .css("left", 700+"px")
                   		.css("top", 150+"px")
                       .html('<strong>'+pieLabel+':</strong> '+d.data[pieLabel]+
                        '<br><strong>Traffic:</strong>'+d.data.Traffic+
                        '<br><strong>Percent:</strong>'+parseInt((d.data.Traffic/total)*100)+"%")
                      .show();
                  })
				.on('click',function(d)
                	{	
                		filterResults=''+pieLabel+"="+d.data[pieLabel];
                		filterArea.setFilter(pieLabel,d.data[pieLabel],true);
                		clearAll();
                		LoadRootCharts(stDate,edDate,filterResults);
                		$("#root_RefMonth").html("");
                		
                	})
				.on("mouseout",function(){ 
					$("#tooltip").hide();
		         d3.select(this).select("path").transition()
	               .duration(500)
	               .attr("d", arc);
	           })

        arcs.append("svg:path")
                .attr("d", arc)
                .style("fill", function(d,i) { return color(i); })                                  
 
        arcs.append("svg:text")                                    
                .attr("transform", function(d) {                   
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";        
            })
            .attr("text-anchor", "middle")                         
            .text(function(d) { return parseInt((d.data.Traffic/total)*100) +"%"; });     

	var xLegend=200,yLegend=14;       
	var legend = arcs.append("g")
	    .attr("class", "legend")
	    .attr("width", radius)
	    .attr("height", radius * 2)
	    .selectAll("g")
	    .data(data)
	    .enter().append("g")
	    .attr("transform", function(d, i) {return "translate("+-xLegend+"," + (-i) * yLegend + ")"; });

	legend.append("rect")
	    .attr("width", 10)
	    .attr("height", 10)
	    .style("fill", function(d,i) { return color(i); }) 

	legend.append("text")
	    .attr("x", 14)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .text(function(d) { return d[pieLabel]; });
	  });
}

function hbar(file,chartDiv,title,barHeight,left,top,xLabel,yLabel,compareby)
{


	left=-1300,top=400,gap=3;
	var compcount=3;
	var valueLabelWidth = 40; // space reserved for value labels (right)
	//var barHeight = 13; // height of one bar
	var barLabelWidth = 52; // space reserved for bar labels
	var barLabelPadding = 5; // padding between bar and bar labels (left)
	var gridLabelHeight = 48; // space reserved for gridline labels
	var gridChartOffset = 13; // space between start of grid and first bar
	var maxBarWidth = 420; // width of the bar with the max value

	d3.tsv(file, function (error,data) {  
  		if (error) return console.warn(error); 
	// accessor functions 
	var barLabel = function(d) {return (d[yLabel])};
	//var barYear = function(d) { return d[yLabel];};
	var barValue = function(d) { return parseFloat(d[xLabel]); };

	// scales
	var yScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeBands([0, data.length * barHeight]);
	var y = function(d, i) { return yScale(i); };
	var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
	var x = d3.scale.linear().domain([0, d3.max(data, barValue)]).range([0, maxBarWidth]);
	var height = data.length * barHeight+ gridLabelHeight + gridChartOffset;
	var width = maxBarWidth + barLabelWidth + valueLabelWidth;
	// svg container element
	var chart = d3.select(chartDiv).append("svg")
	  .attr('width', width)
	  .attr('height',  height);
	// grid line labels
	var gridContainer = chart.append('g')
	  .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 

	gridContainer.selectAll("text").data(x.ticks(10)).enter().append("text")
	  .attr("x", x)
	  .attr("dy", -3)
	  .attr("text-anchor", "middle")
	  .text(String);
	// vertical grid lines
	gridContainer.selectAll("line").data(x.ticks(10)).enter().append("line")
	  .attr("x1", x)
	  .attr("x2", x)
	  .attr("y1", 0)
	  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
	  .style("stroke", "#ebebeb");
	// bar labels
	var labelsContainer = chart.append('g')
	  .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 

	labelsContainer.selectAll('text').data(data).enter().append('text')
	  .attr('y', yText)
	  .attr('stroke', 'none')
	  .attr('fill', 'black')
	  .attr("dy", ".35em") // vertical-align: middle
	  .attr('text-anchor', 'end')
	   .text(function(d,i)
	   {
	   	if(compareby!="")
		    if(i%compcount==0) 
		      return barLabel(d); 
		else
			return barLabel(d);
	  });
	    var xPosition = height/2;
	// bars
	var barsContainer = chart.append('g')
	  .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 

	  barsContainer.selectAll("rect")
	  	.data(data).enter().append("rect")
	    .on("mouseover", function (d, i) {
	    var text = '<strong>'+yLabel+':</strong> '+d[yLabel]+
	            '<br><strong>Traffic:</strong>'+ d3.round(d[xLabel], 2);
			if(compareby!="")
			    text+='<br><strong>Year:</strong>'+d.Year;
				d3.select(this).classed("highlight", true);
			   
		    $("#tooltip")
		          .css("left",100+"px")
		       		.css("top",150 +"px")
		     		.html(text)
		            .show();
	        })
	    .on("mouseout",function(){ 
				d3.select(this).classed("highlight", false);
	    		$("#tooltip").hide()
	    	})
	    .on("click",  function(d) {
		  		renderLevel2(yLabel,d);
		})
	  	.transition()
	    .delay(function(d, i) { return i * 100 })
	    .duration(100)
	  	.attr('y', y)
	  	.attr('height', function(d,i) {
		  	if(compareby!="")
		  	{
	            if((i+1)%compcount==0&&i!=0)
	               return yScale.rangeBand()-gap;
	            else
	              return yScale.rangeBand();
		    }
			else
				return yScale.rangeBand();
		    })
	  .attr('width', function(d) { return x(barValue(d)); })
	  .attr('stroke', 'white')
	  .attr("fill", function(d,i) { return color(i); })
	// bar value labels
	barsContainer.selectAll("text").data(data).enter().append("text")
	  .attr("x", function(d) { return x(barValue(d)/2); })//display in middle
	  .attr("y", yText)
	  .attr("dx", 5) // padding-left
	  .attr("dy", ".35em") // vertical-align: middle
	  .attr("text-anchor", "start") // text-align: right
	  .attr("fill", "black")
	  .attr("stroke", "none")
	  .text(function(d) { return d3.round(barValue(d), 2); });
	// start line
	barsContainer.append("line")
	  .attr("y1", -gridChartOffset)
	  .attr("y2", yScale.rangeExtent()[1] + gridChartOffset)
	  .style("stroke", "#000");

	barsContainer.append("svg:text")
	     .attr("class", "titles")
	     .attr("x", -40)
	     .attr("y", -40)
	     .text(title);
	if(compareby!="")
	{
	 	var years = [];
		$.each(data, function (i) {
	    var year = data[i].Year;
	    if ($.inArray(year, years)==-1) {
	        years.push(year);
	    };
	});
	years.sort(function(x, y) { return x < y; });
	// add legend   
	var legend = barsContainer.append("g")
	    .attr("class", "legend")
	    .attr("width", 10)
	    .attr("height", 10)   
	    .attr("transform","translate(440,0)");

	legend.selectAll('rect')
		.data(years)
		.enter()
		    .append("rect")
		    .attr("x", valueLabelWidth - 65)
		    .attr("width", 10)
		    .attr("height", 10)
		    .attr("y", function(years,i) {
		        return i * 20;
		    })
		    .style("fill", function(i) {
		        return color(i);
		    });

	legend.selectAll('text')
		.data(color)
		.enter()
		    .append("text")
		    .attr("x", valueLabelWidth - 52)
		    .attr("y", function(d, i) {
		        return i * 20 + 9;
		    })
		    .text(function(d,i) {
		        return years[i];
		    });
		}
	});
}

function line(file,chartDiv,xLabel,yLabel,width,height,title,margin,informat,outformat,top,left)
{

	width=500,height=500,left=100,top=150;
	//days
	var days=['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var msPerDay = 86400000,
	 aSunday = Number( new Date(2014, 0, 5) );
	// set up a drawing context
	d3.tsv(file, function (error,data) {  
  		if (error) return console.warn(error); 
	// d3 init
	var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);
	var format = d3.time.format(informat);
	var months = d3.keys(data[0]).filter(function(key) { return key !== "Month"; }); 
	var xAxis = d3.svg.axis().scale(x).orient("bottom")
		        .ticks(6)
		        .tickSubdivide(3).tickSize(-height, -height, 0)
		        .tickFormat(d3.time.format(outformat));
	var yAxis = d3.svg.axis().scale(y).orient("left")
				.ticks(10)
				.tickSubdivide(3).tickSize(-width,-width , 0);
	var svg = d3.select(chartDiv).append("svg")
			    .attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
			    .append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"
	);

	var parseDate = d3.time.format(informat).parse;
	 if (xLabel!="Day" ) 
	 {
	    data.forEach(function(d) {
	    	if(informat!="")
	            d[xLabel] = parseDate(d[xLabel]);
	        else
	        	d[xLabel] = d[xLabel];
	            d[yLabel] = + d[yLabel];
	        });
	}
	var dateFn = function(d) { return aSunday + msPerDay * days.indexOf(d[xLabel]); };
	var text="";
	var valueline = d3.svg.line()
		.interpolate("cardinal")
        .x(function(d) {
                if (xLabel=="Day") 
                    return x(dateFn(d)); 
                else
                    return x(d[xLabel]);
            })
        .y(function(d) {
            return y(d[yLabel]);});


    // Scale the range of the data
     if (xLabel=="Day") 
        x.domain(d3.extent(data, dateFn))
       
    else
    x.domain(d3.extent(data.map(function(d) { return d[xLabel]; })));
    y.domain([0, d3.max(data, function(d) {
        return d[yLabel];
    })]);

    svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("y", -20)
            .attr("x",width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(xLabel);

    svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 10)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yLabel);

	// Add the valueline path.
    svg.append("path") 
	    	.transition() 
			.ease("linear")
			.duration(100) 
			.delay(200)
	        .attr("d", valueline(data))
	        .attr("class","singleline")

    // Add title   
  	svg.append("svg:text")
		     .attr("class", "titles")
		     .attr("x",0)
		     .attr("y", -5)
		     .text(title);

    // Add the black dots
    svg.selectAll("dot")                                    
	        .data(data)                                         
	        .enter().append("circle")                               
	        .attr("r", 2)
	        .attr("class","ldot")
	        .attr("cx", function(d) { 
	            if (xLabel=="Day") 
	                 return x(dateFn(d));
	            else
	                return x(d[xLabel]);
	        })
	        .attr("cy", function(d) { return y(d[yLabel]); })
	        .on('mouseover',function(d)
	            {   
	                text='<strong>'+yLabel+':</strong>'+d3.round(d[yLabel],2);
	                $("#tooltip")
	                   .css("left", (left)+"px")
	                   .css("top", (top)+"px")
	                   .html(text)
	                   .show(); 
	            })
	        .on("mouseout",function(){ $("#tooltip").hide()})
	});
}


function renderLevel2()
{
	clearAll();
	//Resc hour
	chartDiv="#root_RefMonth",xLabel="Hour",yLabel="Traffic",title="Traffic Volume per hour";
	width="500",height="500";
	var informat="%I",outformat="%H",width=360, left=-1000,top=1200;
	line("data/hour.tsv",chartDiv,xLabel,yLabel,width,height,title,margin,informat,outformat,top,left);
	//day
	chartDiv="#root_chart",left=60,xLabel="Day",yLabel="Traffic";
	title="Traffic Volume per week day";
	informat="%I",	outformat="%A",left=-200,width="500",height="500";
	line("data/days.tsv",chartDiv,xLabel,yLabel,width,height,title,margin,informat,outformat,top,left);
}