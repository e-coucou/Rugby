// Menu Header
function menu(selGraphe) {
var data_menu = [
        { n:0, x:-240, m:'th', a:'Live',http:'RWC-2019.html'},
        { n:1, x:-240, m:'chart-line', a:'Ranking', http:'index.html'},
        { n:2, x:-240, m:'project-diagram', a:'Graphe', http:'wrc.html'},
        { n:3, x:-240, m:'headset', a:'Live'}
//        { n:3, x:-240, m:'cogs', a:'Parametre'}
//        { n:4, x:-240, m:'filter', a:'Selection'},
//        { n:5, x:-240, m:'diagnoses', a:'Dashboard'},
//        { n:-1, x:-240, m:'user-secret', a:'credential'}
    ];
var svgMenu = d3.select("#menu").append("svg")
    .attr('width',45*data_menu.length).attr('height',40);
var menuG = svgMenu.selectAll('g').data(data_menu).enter()
        .append('g')
        .attr('transform',(d,i)=>{return 'translate('+(i*40+20)+',10)';})
        .on('click',clickMenu);
var menuCircle=false;
    menuG.append('rect').style('fill',(d,i)=>(d.n==selGraphe)?'#2C14dC':'#00007f').attr('id','menuRect')
        .attr('r',17).attr('width',38).attr('height',39).attr('x',-8).attr('y',-9)
        .on('mouseover',function(d) {d3.select(this).style('fill','blue')})
        .on('mouseout',function(d){d3.select(this).style('fill',(d,i)=>(d.n==selGraphe)?'#2C14dC':'#00007f')});
    if (menuCircle) {
        menuG.append('circle').style('fill',(d,i)=>(d.n==selGraphe)?'red':'#FE6FcE')
            .attr('r',17).attr('cx',(d,i)=>{return 10;}).attr('cy',10);
    }

    menuG.append('svg').attr('width',20)
    .attr('height',20)
    .attr('class',(d)=>{return ('icon fas fa-'+d.m);}).style('color','white');

	function clickMenu(d,i) {
		if (d.http != null) {
			console.log(d.http); window.location.href=d.http;
		} else {
			console.log(d.n);
			selPage(d.n);
		}
		//    doGraphe(d.n);
		//    selGraphique();
	}
}