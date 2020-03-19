if (typeof d3 === 'undefined' || typeof $ === 'undefined') { throw new Error('EETooltip requires D3JS and Jquery') }

function EETooltip(options) {
    this.svgId = options.svgId;
    this.svg = d3.select("#" + this.svgId);
    this.tooltipId = options.tooltipId;
	this.headerText = options.headerText;
	this.footerText = options.footerText;
	this.keepInSVG =  (options.keepInSVG === undefined) ? true : options.keepInSVG;
	this.initialize();
}

EETooltip.prototype.initialize = function() {
	var svgLeft = $('#' + this.svgId).offset().left;
	var svgRight = svgLeft + $('#' + this.svgId).width();
	var svgTop = $('#' + this.svgId).offset().top;
	var svgBottom = svgTop + $('#' + this.svgId).height();
	
    var eetooltip = d3.select('#' + this.tooltipId);
	eetooltip.attr("class", "eetooltip eetooltip-small");
	
	var eetooltipContainer = eetooltip.append("div")
		.attr("class", "eetooltip-container");
	
	if (this.headerText !== 'undefined') {
		var eetooltipHeader = eetooltipContainer.append("div")
			.attr("class", "eetooltip-header");
	
		var eetooltipTitle = eetooltipHeader.append("div")
			.attr("class", "eetooltip-data-title")
			.attr("id", this.tooltipId + "-title");
		eetooltipTitle.html(this.headerText);
	}
	
	var eetooltipDataContainer = eetooltipContainer.append("div")
		.attr("class", "eetooltip-data-container");
	this.eetooltipDataContainer = eetooltipDataContainer;
	
	if (this.footerText !== 'undefined') {
		var eetooltipFooterSeparator = eetooltipContainer.append("div")
			.attr("class", "eetooltip-data-seperator");
	
		var eetooltipFooter = eetooltipContainer.append("div")
			.attr("class", "eetooltip-footer")
			.attr("id", this.tooltipId + "-footer");
		eetooltipFooter.html(this.footerText);
	}
	
    var eetooltipArrow = eetooltip.append("div")
		.attr("class", "eetooltip-arrow");
	
	var curtooltipId = this.tooltipId;
	var keepInSVG = this.keepInSVG;
	this.svg.on("mousemove", function(d) {
		var tooltipWidth = $('#' + curtooltipId).width();
		var tooltipHeight = $('#' + curtooltipId).height();
		
		// Standard position
		var tooltipLeft = d3.event.pageX - tooltipWidth / 2;
		var tooltipTop = d3.event.pageY - tooltipHeight - 10;
		var	tooltipArrowLeft = tooltipWidth / 2;

		// by default
		eetooltipArrow.style("bottom", "-5px");
		eetooltipArrow.style("top", "auto");
		
		// Correct horizontal position to keep tooltip in svg but let the arrow goes to the border
		if (tooltipLeft < svgLeft) {
			tooltipLeft = svgLeft;
			tooltipArrowLeft = Math.max(d3.event.pageX - svgLeft, 7);
		} else if ((tooltipLeft + tooltipWidth) > svgRight) {
			tooltipLeft = svgRight - tooltipWidth;
			tooltipArrowLeft = d3.event.pageX - svgRight + tooltipWidth;
		}
		
		// Correct vertical position to keep tooltip in svg
		if (keepInSVG && tooltipTop < svgTop) {
			tooltipTop = d3.event.pageY + 10;
			eetooltipArrow.style("bottom", "auto");
			eetooltipArrow.style("top", "-5px");
		} else if ((tooltipTop + tooltipHeight) > svgBottom) {
			tooltipTop = svgBottom - tooltipHeight;
		}
		
		// Apply position
		eetooltipArrow.style("left", tooltipArrowLeft + "px"); 
		eetooltip.style("left", tooltipLeft + "px")     
			.style("top", tooltipTop + "px");
	});
}

EETooltip.prototype.show = function() {
	d3.select('#' + this.tooltipId).style("visibility", "visible");
}

EETooltip.prototype.hide = function() {
	d3.select('#' + this.tooltipId).style("visibility", "hidden");
}

EETooltip.prototype.updateTitle = function(title) {
	if (this.headerText !== 'undefined') {
		d3.select('#' + this.tooltipId + "-title").html(title);
	}
}

EETooltip.prototype.updateFooter = function(footer) {
	if (this.footerText !== 'undefined') {
		d3.select('#' + this.tooltipId + "-footer").html(footer);
	}
}

EETooltip.prototype.addDataBlock = function(name, value) {
	var eetooltipDataBlock = this.eetooltipDataContainer.append("div")
		.attr("class", "eetooltip-data-block");
	
	var eetooltipDataName = eetooltipDataBlock.append("div")
		.attr("class", "eetooltip-data-name");
	eetooltipDataName.html(name);
	
	var eetooltipDataValue = eetooltipDataBlock.append("div")
		.attr("class", "eetooltip-data-value");
	eetooltipDataValue.html(value);
}

EETooltip.prototype.removeAllDataBlocks = function() {
	this.eetooltipDataContainer.html("");
}

EETooltip.prototype.addDataSeparator = function() {
	this.eetooltipDataContainer.append("div")
		.attr("class", "eetooltip-data-seperator");
}