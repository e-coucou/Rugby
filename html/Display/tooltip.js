    d3.helper = {};

    d3.helper.tooltip = function () {
        var tooltipDiv;
        var bodyNode = d3.select('body').node();

        function tooltip(selection) {
            selection.on('mouseover.tooltip', function (point) {
                console.log('ici');
                // Clean up lost tooltips
                d3.select('body').selectAll('div.tooltip').remove();
                // Append tooltip
                tooltipDiv = d3.select('body')
                    .append('div')
                    .attr('class', 'tooltip');
                var absoluteMousePos = d3.mouse(bodyNode);
                tooltipDiv
                    .style('left', (absoluteMousePos[0] + 10) + 'px')
                    .style('top', (absoluteMousePos[1] - 30) + 'px');

                var line = '';
                _.each(d3.keys(point), function (key, index) {
                    if (index != d3.keys(point).length - 1) {
                        line += key + ': ' + point[key] + '</br>';
                    } else {
                        line += key + ': ' + point[key];
                    }
                });
                tooltipDiv.html(line);
            })
                .on('mousemove.tooltip', function () {
                    // Move tooltip
                    var absoluteMousePos = d3.mouse(bodyNode);
                    tooltipDiv
                        .style("left", (absoluteMousePos[0] + 10) + 'px')
                        .style("top", absoluteMousePos[1] < 80 ? absoluteMousePos[1] + 10 :(absoluteMousePos[1] - 70) + 'px');
                })
                .on('mouseout.tooltip', function () {
                    // Remove tooltip
                    tooltipDiv.remove();
                });

        }

        tooltip.attr = function (_x) {
            if (!arguments.length) return attrs;
            attrs = _x;
            return this;
        };

        tooltip.style = function (_x) {
            if (!arguments.length) return styles;
            styles = _x;
            return this;
        };

        return tooltip;
    };
