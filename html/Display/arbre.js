//-----------------------------------------------------------------------------------
// Dessin de l'arbre ......


class Arbre {
//	seed = {i: 0, x: 40, y:40, a: 0, l: 10, d:1}; // a = angle, l = length, d = depth {i: 0, x: 420, y: 600, a: 0, l: 130, d:0};
	da = 0.4; // Angle 50%
	dl = 0.8; // longueur
	ar = 0.7; // Alea : 
	maxDepth = 11;
	branches = [];

	constructor(svg,seed) {
		this.svg = svg;
		this.seed = seed;
//		console.log(this.da,this.dl,this.ar,this.maxDepth);
  }
// Tree creation functions
	branch(b) {
	var end = this.endPt(b), daR, newB;
	this.branches.push(b);

	if (b.d === this.maxDepth)
		return;

	// Left branch
	daR = this.ar * Math.random() - this.ar * 0.5;
	newB = {
		i: this.branches.length,
		x: end.x,
		y: end.y,
		a: b.a - this.da + daR,
		l: b.l * this.dl,
		d: b.d + 1,
		parent: b.i
	};
	this.branch(newB);

	// Right branch
	daR = this.ar * Math.random() - this.ar * 0.5;
	newB = {
		i: this.branches.length,
		x: end.x, 
		y: end.y, 
		a: b.a + this.da + daR, 
		l: b.l * this.dl, 
		d: b.d + 1,
		parent: b.i
	};
	this.branch(newB);
}
	regenerate(initialise=true) {
		this.branches = [];
		this.branch(this.seed);
		initialise ? this.create(this.svg) : this.update(this.svg);
	}
	endPt(b) {
	// Return endpoint of branch
		let x = b.x + b.l * Math.sin( b.a );
		let y = b.y - b.l * Math.cos( b.a );
		return {x: x, y: y};
	}
// D3 functions
	x1(d) {return d.x;}
	y1(d) {return d.y;}
	x2(d) {return this.endPt(d).x;}
	y2(d) {return this.endPt(d).y;}
	highlightParents(d) {
		var colour = d3.event.type === 'mouseover' ? 'black' : '#7BB661';
		var depth = d.d;
		for(var i = 0; i <= depth; i++) {
			d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
			d = this.branches[d.parent];
		}	
	}

	create() {
		var md = this.maxDepth;
		svg.selectAll('line')
			.data(this.branches)
			.enter()
			.append('line')
			.attr('x1', d=>this.x1(d))
			.attr('y1', d=>this.y1(d))
			.attr('x2', d=>this.x2(d))
			.attr('y2', d=>this.y2(d))
			.style('stroke',d=>{ return d.d<4?'#88540B':'#7BB661';})
			.style('stroke-width', function(d) { return parseInt((md - d.d)/2) + 'px';})
			.attr('id', function(d,i) {return 'id-'+d.i;});
//		.on('mouseover', highlightParents)
//		.on('mouseout', highlightParents);
	}
	update() {
		svg.selectAll('line')
			.data(this.branches)
			.transition()
			.attr('x1', d=>this.x1(d))
			.attr('y1', d=>this.y1(d))
			.attr('x2', d=>this.x2(d))
			.attr('y2', d=>this.y2(d));
	}

}// end Class