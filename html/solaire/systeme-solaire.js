// URL: https://observablehq.com/@e-coucou/systeme-solaire
// Title: Untitled
// Author: e-Coucou (@e-coucou)
// Version: 1450
// Runtime version: 1

const m0 = {
  id: "c9711c9c19ee579a@1450",
  variables: [
    {
      inputs: ["html"],
      value: (function(html){return(
html`<h1>Système Solaire</h1>`
)})
    },
    {
      name: "viewof system",
      inputs: ["width","d3","DOM","planete_origine","d3tip","epAnim","texte"],
      value: (function(width,d3,DOM,planete_origine,d3tip,epAnim,texte)
{ 
  const margin = {left:10, right:15, top:10, bottom:10 };
  width = width *0.9;
  const height = width*0.5;
  const coef_sat = 1;
  let coef_rot=365.25, trajSample=30,trajFutur=50;
  let Ldist=0,Pdist=0,Rdist=3,cDist=false; 
  let incline= Math.PI/2-Math.PI/12;
  let r_ratio = 20/6500*width/900;
  let svg = d3.select(DOM.svg(width, height));
  let speed=100, zoom=8, ratio = 2*height/zoom; // fixer les orbites en fct de celui de la terre 150 Mkm distance au Soleil
  var compteur=0, f_img=true, barre=0;
  let origine = { id : 0, coef_rot: coef_rot, incline: incline, zoom: zoom, speed: speed};
//-------------copyright-----------------
  let drag = d3.drag().on('drag',dragIncline);
  let bg =svg.append('rect').attr('width',width).attr('height',height).style('fill','black').call(drag);
  let ecoucou = svg.append('text')
    .style('fill','white').attr("text-anchor", "end").attr("font-family","sans-serif")
    .style("font-size","8px").attr('x',width-margin.right).attr('y',margin.top*1.5)
    .text('e-Coucou y2kJ');
  svg.append('text')
    .style('fill','white').attr("text-anchor", "start").attr("font-family","sans-serif")
    .style("font-size","8px").attr('x',margin.left).attr('y',height-margin.bottom)
    .text('pour Tristan.');
//------- parametres du menu----------------
  let param = {mode: 1, nb:10, size: 55, x0:45, y0:50, k:7, couleur : "#40D0F0", close : '#c0c0c0', cInit: 'yellow'}; //0 ligne, 1 cercle
var data_menu = [
		{ n:1, x:80, m:'redo-alt', a: 'RotAvant'},
		{ n:3, x:160, m:'fast-forward', a:'Accelere'},
		{ n:7, x:240, m:'fast-backward', a:'Ralenti'}, 
		{ n:6, x:-80, m:'search-minus', a:'deZoom'},
		{ n:4, x:-160, m:'search-plus', a:'Zoom'},
		{ n:0, x:-240, m:'cogs', a:'Start'},
		{ n:9, x:-320, m:'undo-alt', a:'RotArriere'},
		{ n:2, x:-320, m:'step-forward', a:'Acc'},
		{ n:8, x:-320, m:'step-backward', a:'Ral'},
		{ n:5, x:-320, m:'eye', a:'Hidde', m2:'eye-slash'}
	];
  var  up_dw = true;
//----------- la voie lactée--------
  let etoile = [], nbE = Math.trunc(Math.random()*100+50);
  let anim_ff = 0; // fli/flop animation
  for (var i = 0; i<=nbE;i++) {
    var pt= {};
    pt['x'] = Math.trunc(Math.random()*width);
    pt['y'] = Math.trunc(Math.random()*height);
    etoile.push(pt);
  }
//  Create SVG MENU
    param.x0 = (width - param.x0);
    param.y0 = param.y0;
  let planete = planete_origine, index={};
  for (var i in planete) {
    var angle = Math.random()*2*Math.PI;
    var j = (index[planete[i].s]);
    planete[i]['a'] = angle;
    planete[i].cx = Math.sqrt(planete[i].R1*ratio)*Math.cos(angle)+(planete[i].id==0 ? width/2 : planete[j].cx);
    planete[i].cy = Math.sqrt(planete[i].R2*ratio)*Math.sin(angle)+(planete[i].id==0 ? height/2: planete[j].cy);
    index[planete[i].id]=i;
  } 
  let planete_save=planete;
  let el = svg.selectAll('ellipse').data(planete).enter()
      .append('ellipse').attr('id',d=>{return 'e-'+d.n;})
      .attr('cx',function(d,i){return ((d.id==0 ? width/2 : planete[d.s].cx));})
      .attr('cy',function(d,i){return ((d.id==0 ? height/2 : planete[d.s].cy));})
      .attr('rx',d=>{return Math.sqrt(d.R1*ratio);})
      .attr('ry',d=>{return Math.sqrt(d.R2*ratio);})
   .style("stroke", "#555555").style("fill",'transparent').style("stroke-width", "1px").style("stroke-dasharray", ("4, 2")).call(drag).raise();
//----- on creer les planetes .. et les lunes !
  let p = svg.selectAll('g').data(planete).enter()
       .append('g')
       .attr('transform',d => {return 'translate('+d.cx+','+d.cy+')';});
  let toto = d3.interval(animate,100); toto.stop();
  // On affiche les étoiles dans le ciel qui scintillent ...
  let stars = svg.append('g').attr('id','star').selectAll('circle').data(etoile).enter().append('circle')
      .attr('cx',d=>{return d.x;}).attr('cy',d=>{return d.y;})
      .style('fill','white').attr('r',1).style('opacity',function(){return Math.random()*.7;});
  let gTraj = svg.append('g').attr('id','trajectoire');
  //--------le menu
	var gMenu= svg.append("g")
  		.attr("transform", "translate(" + param.x0 + "," + param.y0 + ")")
      .on('click',onOpen);
  var g2Menu= svg.append('g')
      .attr("transform", "translate(" + param.x0 + "," + param.y0 + ")");
	gMenu.append("circle")
      .attr('id','menu')
			.attr("cx", param.size/param.k/2).attr("cy", param.size/param.k/2)
      .attr('r', param.size/param.k).style("fill", param.couleur).style('opacity',1);
  gMenu.append('svg').attr('width',param.size/param.k)
    .attr('height',param.size/param.k).attr('class','icon fas fa-list').style('color','blue');
  //---- les images-------------
  let img_size= Math.max(10,(height-margin.top*2)/planete.length);
  let img = svg.selectAll('image').data(planete).enter()
    .append('image').attr('xlink:href', d=>{return d.img;}).attr('y',d=>{return d.id*img_size;})
    .attr('x',3).attr('width', img_size-1)
    .on('mouseover',imgOver).on('mouseout',imgOut).on('click',imgClick);
  let img_text = svg.append('text').attr('id','imgTxT').attr('x',img_size*1.5+5).attr("text-anchor", "start")
        .attr("font-family","sans-serif").style("font-size","36px").style("font-weight","bold").attr('fill','#aaaaaa');
  // ----------- Les commandes 
  const couleur_btn = '#AfB2Ad';
  let anim = svg.append('g').attr('transform','translate('+(param.x0-param.size*4/6)+','+ (height*.92)+')');
  let anim_text = anim.append('text').style('fill','#d8d8d8').attr("text-anchor", "end")
        .attr("font-family","sans-serif").style("font-size","36px")//.style("font-weight","bold")
        .style("opacity",1.0)
        .attr('dx',param.size).attr('y',14).text('');
//  anim.append('rect')
//      .attr('width',param.size).attr('height',40)
//      .style('fill',"black").raise().style('opacity',.5);
//      .on('click',onAnim);

  var tip = d3tip()
    .attr('class', 'd3-tip')
//    .style('top', 10)
//    .style('left',100)
//    .attr('x',10).attr('y',10)
//    .offset([0,0])
//    .offset(d=>{var o=[]; o.push(-d.cy+200); o.push(-d.cx+80); return o;})
    .html(function(d) {
    return "<strong>"+d.n+"</strong><br><span style='color:white'>Rayon moyen: "+d.r+" km<br>Vitesse: " + (Math.trunc(10*d.v)/10) + " m/s<br>Période de révolution: "+d.p+" jours<br>Aphélie: "+Math.round(d.R1)+".000.000 km<br>Périhélie: "+Math.round(d.R2)+".000.000 km</span>";
    })
  svg.call(tip);
  p.on('click',PlaneteClick)
    .on("mouseover",tip.show) //PlaneteOver)// tip.show) //
    .on("mouseout", tip.hide); //PlaneteOut);
  
  p.append('circle')
    .attr('id',d=>{return d.n;})
    .attr('r',d=>{return Math.log(d.r*d.k*r_ratio);})
    .style('fill',function(d,i){return d.c;});
  
  p.append('image').attr('xlink:href', d=>{return d.img;})
    .attr('x',d=>{return -Math.log(d.r*d.k*r_ratio)*2;})
    .attr('y',d=>{return -Math.log(d.r*d.k*r_ratio)*2;})
    .attr('width', d=>{return Math.log(d.r*d.k*r_ratio)*4;})
    .attr('visibility','hidden');

  p.append('text')
      .style('fill','white').attr("text-anchor", "start")
      .attr("font-family","sans-serif").style("font-size","10px").style('opacity',.7)
      .attr('dx',d=>{return Math.log(d.r*d.k*r_ratio)*1.3;}).attr('y',d=>{-Math.log(d.r*d.k*r_ratio)*1.3;}).text(d=>{return d.n;});

  let distance = svg.append('g').attr('id','distance')
    .attr('transform','translate(100,'+(height-50)+')');
  distance.append('line').style('stroke','white').style('stroke-width',1)
    .attr('x1',10).attr('x2',110).attr('y1',10).attr('y2',10);
  distance.append('text').attr('x',60).attr('y',5)
    .style('fill','white').attr("text-anchor", "middle").attr("font-family","sans-serif")
    .style("font-size","10px");
  distance.append('image').attr('id','reference').attr('xlink:href', planete[index[Rdist]].img)
    .attr('width', 20).on('click',changeDistance);
  distance.append('image').attr('id','cible').attr('xlink:href', planete[index[Pdist]].img)
    .attr('x',100).attr('width', 20);
  
  // Time label.
// On ajoute les axes.
var xScale = d3.scaleLog().domain([1, 100000]).range([width/2, width-30]),
    yScale = d3.scaleLog().domain([1, 1000]).range([height/2, height-40]);
var xAxis = d3.axisBottom().scale(xScale).ticks(10, d3.format(",d")),
    yAxis = d3.axisRight().scale(yScale).ticks(10, d3.format(",d"));
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height-18) + ")")
    .call(xAxis);
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (width-35) + ",0)")
    .call(yAxis);
var label = svg.append("text")
    .attr("class", "time label")
    .attr("text-anchor", "end")
    .attr("y", height - 42)
    .attr("x", width-44)
    .text(0);
let bBox = {x: width/2, y: height-30, w: width/2-margin.left-margin.right, h:30},
     bBoy = {x: width-37, y: height/2-10, w: 30, h:height/2-30};//-margin.top-margin.bottom};
var overlay_label = svg.append("rect")
        .attr("class", "overlay x")
        .attr("x", bBox.x).attr("y", bBox.y)
        .attr("width",bBox.w).attr("height",bBox.h)
        .on("mouseover", timeSelect);
var overlay_y = svg.append("rect")
        .attr("class", "overlay y")
        .attr("x", bBoy.x).attr("y", bBoy.y)
        .attr("width",bBoy.w).attr("height",bBoy.h)
        .on("mouseover", timeFutur);

  redraw(0);

  d3.select("#info").attr("class", "info").html('Clickez sur une planete');
  g2Menu.raise();
  gMenu.raise();
//----------------------------------------------------------------------------
//  les Fonctions !!!!
//--------------------------------------------
function changeDistance() {
  cDist=true;
  d3.select('#reference').attr('width', 2);
}
function timeSelect() {
    var timeScale = d3.scaleLog()
        .domain([1, 100000])
        .range([bBox.x + 1, bBox.x+bBox.w - 1])
        .clamp(true);
    overlay_label
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);
    function mouseover() {
      label.classed("active", true);
    }
    function mouseout() {
      label.classed("active", false);
    }
    function mousemove() {
      let valeur = timeScale.invert(d3.mouse(this)[0]);
//      displayLabel((d3.mouse(this)[0]));
//      valeur=Math.trunc((coef_rot*compteur)*valeur/100);
//      let consigne=Math.trunc(coef_rot*(2*valeur-barre)/10);
      let consigne = Math.trunc((valeur-compteur/2)*coef_rot);
      barre=valeur;
      displayLabel(compteur/2);
      redraw(consigne);
    }
  }

function timeFutur() {
    var timeScale = d3.scaleLog()
        .domain([1, 1000])
        .range([bBoy.y + 1, bBoy.y+bBoy.h - 1])
        .clamp(true);
    overlay_y
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);
    function mousemove() {
      let valeur = timeScale.invert(d3.mouse(this)[1]);
      trajFutur=Math.max(1,Math.trunc(valeur));
      trajSample=Math.min(100,Math.trunc(30/50*trajFutur+1));
      redraw(0);
    }
  }
  function displayLabel(valeur) {
//    dot.data(interpolateData(year), key).call(position).sort(order);
    label.text(Math.round(valeur));
  }
  function dragIncline() {
    var inclineScale = d3.scaleLinear()
        .domain([-Math.PI/12, Math.PI/12])
        .range([0,height])
        .clamp(true);
    let valeur = inclineScale.invert(d3.mouse(this)[1]);
    incline += valeur;
    incline = Math.max(0,Math.min(incline,Math.PI/2));
    redraw(0);
//    console.log(valeur);
  }
  function animate() {
    if (!anim_ff) {
      toto.stop();
//      anim_text.text('--');
    }
    redraw(365.25);
  }
  function imgClick(d) {
    if (cDist) {
      Rdist = d.id;
      cDist=false;
      d3.select('#reference').attr('xlink:href', planete[index[Rdist]].img).attr('width', 20);
    } else {
      origine.id=d.id;
      let param = { ech: 3, duree:4000, width : width, height:height, x:0, y:0, bBG : false, cBG: 'red'};
      let anim = new epAnim(param, d.n);
      anim.couleur = ['red', 'pink','green','yellow','blue'];
      anim.init();
      let g = svg.append('g').attr('id','Anim');
      anim.set_origine(img_size+30,30);
      anim.dessine(g,d.c);
      Pdist = origine.id;
    }
    redraw(0);
  }
//
//--------------------------------------------------------------------- REDRAW !!!
//
  function rotation(i,cx0,cy0,angle) {
      var ratio_s = ratio; //*((planete[i].s) > 0 ? coef_sat : 1);
      var cx = Math.cos(planete[i].i/180*Math.PI)*Math.sqrt(planete[i].R1*ratio_s)*Math.cos(angle)+(planete[i].id==0 ? width/2 : cx0);
      var cy = Math.cos(incline)*(Math.sqrt(planete[i].R2*ratio_s)*Math.sin(angle))+(planete[i].id==0 ? height/2 : cy0);
    return [cx,cy];
  }
  function redraw(move) {
    compteur += move/coef_rot;
    planete=planete_save;
    let visible=[];
    for (var i in planete) {
      angle = (planete[i].a - move/planete[i].p*Math.PI/coef_rot)%(2*Math.PI); //sens inverse
      planete[i]['a'] = angle;
      [planete[i].cx,planete[i].cy] = rotation(i,planete[index[planete[i].s]].cx,planete[index[planete[i].s]].cy,angle);
      if (planete[i].id == origine.id) { 
        origine['dx'] = (width/2-planete[i].cx);
        origine['dy'] = (height/2-planete[i].cy);
      }
    }
    planete_save=planete;
//-------    on change de planete origine ---
    gTraj.selectAll('circle').remove();
    if (origine.id!=1000) { //on affiche tjs les trajectoires !
      visible=[];
      for (var i in planete) {
        var cx = planete[i].cx + origine.dx,
        cy = planete[i].cy + origine.dy;
        if (cx>0 && cx<width && cy>0 && cy<height) { visible.push(i);}
      }
      // On calcule les trajectoires ...
        let trajectoire=[],traj_origine=[];
        for (i in planete) {
          trajectoire.push([]);
        }
        for (i in planete) {
          trajectoire[i].push({cx:planete[i].cx,cy:planete[i].cy,c:i,a:planete[i].a*180/Math.PI});
          if (planete[i].id == origine.id) { 
            traj_origine.push({dx: width/2-planete[i].cx, dy: height/2-planete[i].cy, c:i});
          }
          for (var j=1;j<(trajSample);j++) { // on calcule les futurs ...
//            angle = (planete[i].a + move/planete[i].p*2*Math.PI/coef_rot*j*2)%(2*Math.PI);
            angle = (planete[i].a - trajFutur*2*Math.PI/planete[i].p*(j-0)/trajSample)%(2*Math.PI); //sens inverse
            [cx,cy]=rotation(i,i==0 ? 0: trajectoire[index[planete[i].s]][j].cx,i==0 ? 0 : trajectoire[index[planete[i].s]][j].cy,angle);
            trajectoire[i].push({cx:cx,cy:cy,c:i,a:angle*180/Math.PI});
          if (planete[i].id == origine.id) { 
            traj_origine.push({dx: width/2-cx, dy: height/2-cy}); }
         }
        }
      let data_traj = []; //trajectoire[index[origine.id]];
      for (j in planete) {
        if (visible.includes(j) && j!=index[origine.id]) {
          data_traj.push(...trajectoire[j]);
        }
       }
      // On affiche les trajectoires des astres visibles 
      gTraj.selectAll('circle').data(data_traj).enter()
           .append('circle').attr('r',1).style('fill',d=>{return planete[d.c].c;}).attr('id',function(d,i){return i;})
           .attr('cx',function(d,i){return d.cx+traj_origine[i%trajSample].dx;})
           .attr('cy',function(d,i){return d.cy+traj_origine[i%trajSample].dy;});
      for (var i in planete) {
        planete[i].cx += origine.dx;
        planete[i].cy += origine.dy;
      }
    }
    p.attr('transform',function(d) {return 'translate('+d.cx+','+d.cy+')';});
    p.selectAll('text').attr("text-anchor",d=>{return d.s>=1 ? "end" :"start";});
    d3.select('#star').selectAll('circle').style('opacity',function(){return Math.random()*.6;});
    el.attr('cx',function(d,i){return (d.id==0 ? width/2 : planete[d.s].cx);})
      .attr('cy',function(d,i){return (d.id==0 ? height/2 : planete[d.s].cy);})
      .attr('rx',d=>{return Math.sqrt(d.R1*ratio);})
      .attr('ry',d=>{return Math.sqrt(d.R2*ratio)*Math.cos(incline);})
      .style('visibility',function(d,i) {return (planete[d.s].id==origine.id ? 'visible' : 'hidden');}); //hidden
    if (!anim_ff) {
      toto.stop();
//      anim_text.text('--');
    } else {
//    anim_text.text(Math.trunc(compteur*move/coef_rot));
    label.text(Math.trunc(compteur/2));
    }
    p.selectAll('image')
     .attr('width', d=>{return Math.log(d.r*d.k*r_ratio)*4*Math.max(1,Math.log(zoom/80));})
     .attr('x',d=>{return -Math.log(d.r*d.k*r_ratio)*2*Math.max(1,Math.log(zoom/80));})
     .attr('y',d=>{return -Math.log(d.r*d.k*r_ratio)*2*Math.max(1,Math.log(zoom/80));})
     .attr('visibility',d=>{ return f_img ? 'visible' : 'hidden';});
    calculDistance();
  }
  function calculDistance() {
    // calcul de la distance entre les 2 planetes ...
    let distInit=[];
    for (i in planete) {
      angle = planete[i].a;
      var cx = planete[i].R1*Math.cos(angle)+(planete[i].id==0 ? 0 : distInit[index[planete[i].s]].cx);
      var cy = planete[i].R2*Math.sin(angle)+(planete[i].id==0 ? 0 : distInit[index[planete[i].s]].cy);
      distInit.push({cx:cx,cy:cy,a:angle});
    }
    var x0 = distInit[index[Pdist]].cx-distInit[index[Rdist]].cx;
    var y0 = distInit[index[Pdist]].cy-distInit[index[Rdist]].cy;
    var Ldist = Math.sqrt(x0*x0 + y0*y0);
//    console.log('calcul distance',Ldist);
    d3.select('#distance').selectAll('text').text(Math.round(Ldist*100)/100+' Mkm').raise();
    d3.select('#cible').attr('xlink:href', planete[index[Pdist]].img).raise()
  }
  function onAnim() {
    anim_ff = !(anim_ff); 
    toto.stop();
    if (anim_ff) {
      toto = d3.interval(animate,speed);
    } else {
      toto.stop();
//      anim_text.text('--');
    }
  }
  function PlaneteClick(d) {
//    d3.select(this).style('fill','#88FF44').attr('r', d=>{return Math.log(d.r*d.k*r_ratio)*3;});
  d3.select("#info").style('class','info').html('<h1>'+d.n+'</h1>'+texte[0][d.id]).attr('visibility','visibible');
  }
  function PlaneteOver(d) {
    d3.select(this).style('fill','#88FF44').attr('r', d=>{return Math.log(d.r*d.k*r_ratio)*3;});
//  d3.select("#info").html('<h1>'+d.n+'</h1>'+texte[0][d.id]).attr('visibility','visibible');
  }
  function PlaneteOut() {
    d3.select(this).style('fill',d=>{return d.c;}).attr('r', d=>{return Math.log(d.r*d.k*r_ratio);});
//    d3.select("#info").attr('visibility','hidden');
  }
//------------------MENU-------------
function onOpen() {
//  d3.selectAll('.flyCircle').remove();
  if (up_dw) {
    var g3Menu = g2Menu.selectAll(".flyCircle")
	  	.data(data_menu).enter()
      .append('g')
        .attr('id',d=>{return d.a;})
	  		.attr("class", "flyCircle")
        .on('click',menu)
        .on('mouseout',h_out)
        .on('mouseover',h_over);
    g3Menu.append("circle")
	  		.attr("cx", param.size/param.k/2).attr("cy", param.size/param.k/2)
	  		.attr("r", param.size/param.k).style("fill", param.couleur);
    g3Menu.append('svg').attr('width',param.size/param.k).attr('height',param.size/param.k)
      .attr('class',d=>{return 'icon fas fa-'+d.m;}).style('color','blue');
    g3Menu.transition().duration(1000).delay(function(d,i) { return i*100; })
      .attr('transform', translate);
        d3.select('#menu').transition().duration(2000).delay(100).style('opacity',1).style('fill',param.close);
    gMenu.select('svg').attr('class','icon fas fa-times').style('color','black');
  } else {
  	g2Menu.selectAll(".flyCircle").transition().duration(1000).attr('transform', d=>{return 'translate(0,0)';});
    d3.select('#menu').transition().duration(1500).style('fill',param.couleur).attr('r', param.size/param.k).style('opacity',0.9);
    gMenu.select('svg').attr('class','icon fas fa-list').style('color','blue');
    g2Menu.selectAll(".flyCircle").transition().delay(1000).remove();
  }
  up_dw = !up_dw;
}	
  function menu(d) {
    switch (d.a) {
      case 'Accelere' :
        toto.stop();
        speed *= .8;
        anim_ff = 1; // fli/flop animation
        toto = d3.interval(animate,speed);
        break;
      case 'Acc' :
        coef_rot = Math.max(15.25,coef_rot-50); //redraw();
        break;
      case 'Ral' :
        coef_rot += 50; //redraw();
        break;
      case 'RotAvant' :
        incline = (incline + Math.PI/64)%(Math.PI/2) ; redraw(0);
        break;
      case 'RotArriere':
        incline -= Math.PI/32; redraw(0);
        break;
      case 'Ralenti':
        toto.stop();
        speed /= 0.8;
        anim_ff = 1; // fli/flop animation
        toto = d3.interval(animate,speed);
        break;
      case 'Zoom':
        zoom = (zoom / 0.8 ); ratio /= 0.8; redraw(0);
        break;
      case 'deZoom':
        zoom = (zoom * 0.8 ); ratio *= 0.8; redraw(0);
        break;
      case 'Start':
        onAnim();
        break;
      case 'Hidde':
        f_img = !(f_img);
        var cl='icon fas fa-'+d.m;
        if (f_img) {
          cl='icon fas fa-'+d.m2;}
        d3.select('#Hidde').selectAll('svg').attr('class',cl)
        redraw(0);
        break;
    }
    g2Menu.raise();
    gMenu.raise();
  }

  function translate(d) {
    const coef = .5;
    let t='translate('
    if (param.mode==0) {
      t = t+(d.n-3)*param.size*coef+',-'+param.size*coef+')';
    }else{
      let a = d.n * 2*Math.PI/param.nb - Math.PI/2;
      t = t + Math.cos(a)*param.size*coef + ',' +Math.sin(a)*param.size*coef+')';
    }
    return t;
  }
  function h_over(d) {
    d3.select('#'+d.a).selectAll('circle').style('fill','#ff4444').attr("r", param.size/param.k*1.3);
    d3.select('#'+d.a).selectAll('svg').style('color','white');
  }
  function h_out(d) {
    d3.select('#'+d.a).selectAll('circle').attr("r", param.size/param.k).style("fill", param.couleur);
    d3.select('#'+d.a).selectAll('svg').style('color','blue');
//  origine = { id : 0, coef_rot: coef_rot, incline: incline, zoom: zoom, speed: speed};
    g2Menu.select('#Start circle').style('fill',d=>{return anim_ff ? param.cInit :param.couleur;});
    g2Menu.select('#Hidde circle').style('fill',d=>{return f_img ? param.cInit :param.couleur;});
    g2Menu.select('#Zoom circle').style('fill',d=>{return zoom>origine.zoom ? param.cInit :param.couleur;});
    g2Menu.select('#deZoom circle').style('fill',d=>{return zoom<origine.zoom ? param.cInit :param.couleur;});
    g2Menu.select('#Acc circle').style('fill',d=>{return coef_rot<origine.coef_rot? param.cInit :param.couleur;});
    g2Menu.select('#Ral circle').style('fill',d=>{return coef_rot>origine.coef_rot? param.cInit :param.couleur;});
    g2Menu.select('#Accelere circle').style('fill',d=>{return speed<origine.speed? param.cInit :param.couleur;});
    g2Menu.select('#Ralenti circle').style('fill',d=>{return speed>origine.speed? param.cInit :param.couleur;});
    g2Menu.select('#RotAvant circle').style('fill',d=>{return incline>origine.incline?param.cInit:param.couleur;});
    g2Menu.select('#RotArriere circle').style('fill',d=>{return incline<origine.incline?param.cInit:param.couleur;});
  }
  function imgOver(d) {
    d3.select('#'+d.n).attr('r',d=>{return Math.log(d.r*d.k*r_ratio)*3;}).style('fill','white');
//    d3.select('body').append('div').attr('class','d3-tip').html(function(d) {return "<strong>Coucou</strong><br><span style='color:white'>Rayon moyen: km<br>Vitesse:00.000 km</span>";});
    //.append('text').text('coucoucoucouc').style('fill','red'); 
    d3.select(this)
      .attr('y',d=>{return (d.id*img_size-img_size/4);})
      .attr('width', img_size*1.5).raise();
    d3.select('#imgTxT').attr('y',d.id*img_size+img_size*.75).text(d.n).style('visibility','visible');
  }
  function imgOut(d) {
    d3.select('#'+d.n)
      .attr('r',d=>{return Math.log(d.r*d.k*r_ratio);})
      .style('fill',function(d,i){return d.c;});
    d3.select(this)
      .attr('y',d=>{return d.id*img_size;})
      .attr('width', img_size-1);
    d3.select('#imgTxT').style('visibility','hidden');
  }

  return (svg.node());
}
)
    },
    {
      name: "system",
      inputs: ["Generators","viewof system"],
      value: (G, _) => G.input(_)
    },
    {
      inputs: ["html"],
      value: (function(html){return(
html`<div id="info" class='info'>Help</div>`
)})
    },
    {
      inputs: ["html"],
      value: (function(html){return(
html`<style>
.pass {
  fill: transparent;
  stroke: #000;
}
.fail {
  fill: #000;
  stroke: #000;
}
circle:hover {
  stroke-width: 4px;
}
.d3-tip {
  background: #444;
  color: #0FF;
  padding: 2px 5px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  position: top;
  top: 100px;
  left: 40px;
}
.tooltip {
    opacity: 0.8;
    font: 8px "helvetica neue";
    text-align: left;			
    padding: 2px;
 	line-height: 1;
    font-weight: bold;
	padding: 12px;
    background: #B0C4DE;/*rgba(100 ,149 ,237, 0.8);*/
	color: #191970;
  fill: #ddd;
	border-radius: 1px;
}
.tick text{
  fill: #bbb;
}
.axis path, .axis line {
  fill: #000;
  stroke: #aaa;
  shape-rendering: crispEdges;
}
.info {
  fill: #aaf;
  color: #66F;
  font: 400 12px "Helvetica Neue";
  text-align: justify;
  text-justify: inter-word;
}
.info h1 {
  font: 500 24px "Helvetica Neue";
  font-weight: 800;
  color: #77A;
}
.info h4 {
  font: 400 10px "Helvetica Neue";
  color: #AA9;
}
.label {
  fill: #777;
}

.time.label {
  font: 500 72px "Helvetica Neue";
  fill: #555;
}

.time.label.active {
  fill: #aaa;
}

.overlay.x {
  fill: none;
  pointer-events: all;
  cursor: col-resize;
}
.overlay.y {
  fill: none;
  pointer-events: all;
  cursor: row-resize;
}

</style>`
)})
    },
    {
      name: "planete_origine",
      value: (function(){return(
[{id:0,n:'Soleil',r:695508,R1:0,R2:0,v:0,c:'yellow',k:1,p:1,s:0,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7804/47156338931_0c9a74cf70_o.png', auteur:'NASA [Public domain]'},
{id:3,n:'Terre',r:6371, R1:152.1,R2:147.2, v:29.783, c:'blue',k:1, p:365.25,s:0,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7844/33280801628_f5c23ecfc6_o.png',auteur:'NASA/Apollo 17 crew [Public domain]'},{id:4,n:'Mars',r:3390,R1:206.6,R2:249.2,v:24.1,c:'red',k:1,p:686.96,s:0,cx:0,cy:0,i:1.85061,img:'https://farm8.staticflickr.com/7804/46242449125_c36feb033a_o.png', auteur:'Mars_Valles_Marineris.jpeg: NASA picturederivative work: Lošmi (d) [Public domain]'},{id:2,n:'Venus',r:6052,R1:107.5,R2:108.9,v:35.0,c:'cyan',k:1,p:224.7,s:0,cx:0,cy:0,i:3.39,img:'https://farm8.staticflickr.com/7897/47156513471_a8a36466a6_o.png',auteur:'equired text: &quot;Image processing by R. Nunes&quot;, link to http://www.astrosurf.com/nunes [Public domain]'},{id:1,n:'Mercure',r:2439,R1:69.8,R2:46.0,v:47.4,c:'white',k:1,p:87.97,s:0,cx:0,cy:0,i:7.00487,img:'https://farm8.staticflickr.com/7823/47104279072_154307111a_o.png', auteur:'NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington. Edited version of Image:Mercury in color - Prockter07.jpg by Papa Lima Whiskey. [Public domain]'},{id:5,n:'Jupiter',r:69911,R1:816,R2:740,v:13.1,c:'orange',k:1,p:4335,s:0,cx:0,cy:0,i:1.30530,img:'https://farm8.staticflickr.com/7908/46433457334_99ca3175a1_o.png', auteur:'NASA/JPL/USGS [Public domain]'},{id:6,n:'Saturne',r:58232,R1:1503.98,R2:1349.823,v:9.64,c:'yellow',k:1,p:10757.73,s:0,cx:0,cy:0,i:2.48446,img:'https://farm8.staticflickr.com/7875/32215321237_e9e80595e4_o.png',auteur:'NASA/JPL-Caltech/SSI [Public domain]'},           {id:8,n:'Neptune',r:24622,R1:4553.946,R2:4452.940,v:5.43,c:'blue',k:1,p:60224.90,s:0,cx:0,cy:0,i:1.76917,img:'https://farm8.staticflickr.com/7812/40192159113_56c4e22d29_o.png', auteur:'NASA/JPL [Public domain]'},{id:7,n:'Uranus',r:25559,R1:3006.318,R2:2734.998,v:6.80,c:'green',k:1,p:30687.15,s:0,cx:0,cy:0,i:0.77,img:'https://farm8.staticflickr.com/7875/46242892875_866f4acba7_o.png',auteur:'NASA/JPL [Public domain]'},{id:9,n:'Pluton',r:1185,R1:7375.927,R2:4436.824,v:4.74,c:'blue',k:1,p:90487,s:0,cx:0,cy:0,i:17.0890009,img:'https://farm8.staticflickr.com/7923/46242986155_129370260d_o.png',auteur:'NASA / Johns Hopkins University Applied Physics Laboratory / Southwest Research Institute [Public domain]'},
{id:10,n:'Lune',r:1737,R1:0.406,R2:0.356,v:1.02,c:'white',k:1,p:27.3,s:3,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7880/47156375111_d568062ce2_o.png',auteur:'NASA/GSFC/Arizona State University [Public domain]'},{id:11,n:'IO',r:3643,R1:0.423,R2:0.420,v:10.0,c:'yellow',k:1,p:1.769,s:5,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7909/32215349357_5aa1ea3214_o.png', auteur:'NASA / JPL / University of Arizona [Public domain]'},{id:12,n:'Europe',r:3121,R1:0.677,R2:0.665,v:10.0,c:'orange',k:1,p:3.551,s:5,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7845/47112143212_340c0896e8_o.png', auteur:'NASA/JPL/DLR [Public domain]'},{id:13,n:'Ganymède',r:3121,R1:1.069,R2:1.072,v:10.88,c:'grey',k:1,p:7.155,s:5,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7810/46249976345_dc25aee859_o.png', auteur:'NASA/JPL/DLR [Public domain]'},{id:14,n:'Callisto',r:4820,R1:1.869,R2:1.897,v:0.0,c:'red',k:1,p:16.689,s:5,cx:0,cy:0,i:0,img:'https://farm8.staticflickr.com/7820/47164115141_4237579eae_o.png',auteur:'NASA [Public domain]'}
//,{id:15,n:'Phobos',r:22,R1:0.0094,R2:0.01,v:0.0,c:'red',k:1,p:0.319,s:4,cx:0,cy:0,i:0,img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Callisto2.jpg/520px-Callisto2.jpg'}
                  ]
)})
    },
    {
      name: "texte",
      value: (function(){return(
[{6:"Saturne est la sixième planète du Système solaire par ordre de distance au Soleil et la deuxième après Jupiter tant par sa taille que par sa masse. Saturne est une planète géante, au même titre que Jupiter, Uranus et Neptune, et plus précisément une géante gazeuse de type Jupiter froid comme Jupitera. D'un diamètre d'environ neuf fois et demi celui de la Terre, elle est majoritairement composée d'hydrogène et d'hélium. Sa masse vaut 95 fois celle de la Terre6 et son volume 900 fois celui de notre planète1. Sa période de révolution est d'environ 29 ans. Elle était au périhélie le 26 juillet 20037 et à l'aphélie le 17 avril 20188. Saturne a un éclat bien plus faible que celui des autres planètes observables à l’œil nu. Sa magnitude apparente peut atteindre lors de l'opposition un maximum de 0,439, tandis que son diamètre apparent varie de 14,5 à 20,5 secondes d'arc et que sa distance à la Terre varie de 1,66 à 1,20 milliard de kilomètres9.<br>Saturne possède un système d'anneaux, composés principalement de particules de glace et de poussière. Saturne possède de nombreux satellites, dont cinquante-trois ont été confirmés et nommés. Titan est le plus grand satellite de Saturne et la deuxième plus grande lune du Système solaire après Ganymède autour de Jupiter. Titan est plus grand que la planète Mercure et est la seule lune du Système solaire à posséder une atmosphère significative.<br>Plus lointaine des planètes du Système solaire observables à l'œil nu dans le ciel nocturne depuis la Terre10, elle est connue depuis la Préhistoire11.",
          3:"La Terre est une planète du Système solaire, la troisième plus proche du Soleil et la cinquième plus grande, tant en taille qu'en masse, de ce système planétaire dont elle est également la plus massive des planètes telluriques.<br>La Terre s'est formée il y a 4,54 milliards d'années environ et la vie y est apparue moins d'un milliard d'années plus tard1. La planète abrite des millions d'espèces vivantes, dont les humains2. La biosphère de la Terre a fortement modifié l'atmosphère et les autres caractéristiques abiotiques de la planète, permettant la prolifération d'organismes aérobies de même que la formation d'une couche d'ozone qui, associée au champ magnétique terrestre, bloque une partie des rayonnements solaires, permettant ainsi la vie sur Terre3. Les propriétés physiques de la Terre, de même que son histoire géologique et son orbite, ont permis à la vie de subsister durant cette période. De plus, la Terre devrait pouvoir maintenir la vie (telle que nous la connaissons actuellement) durant encore au moins 500 millions d'années. La croûte terrestre est divisée en plusieurs segments rigides appelés plaques tectoniques qui se déplacent sur des millions d'années. Environ 71 % de la surface terrestre est couverte par des océans d'eau salée qui forment l'hydrosphère avec les autres sources d'eau comme les lacs, les fleuves ou les nappes phréatiques. Les pôles géographiques de la Terre sont principalement recouverts de glace (inlandsis de l'Antarctique) ou de banquises. L'intérieur de la planète reste actif avec un épais manteau composé de roches silicatées (généralement solides, mais localement fondues), un noyau externe de fer liquide qui génère un champ magnétique, et un noyau interne de fer solide. La Terre interagit avec les autres objets spatiaux, principalement le Soleil et la Lune. Actuellement, la Terre orbite autour du Soleil en 365,256 363 jours solaires ou une année sidéralea. L'axe de rotation de la Terre est incliné de 23,437°6 par rapport à la perpendiculaire du plan de l'écliptique, ce qui produit des variations saisonnières sur la surface de la planète avec une période d'une année tropique (365,24219 jours solaires)7. Le seul satellite naturel connu de la Terre est la Lune qui commença à orbiter il y a 4,5 milliards d'années. Celle-ci provoque les marées, stabilise l'inclinaison axiale et ralentit lentement la rotation terrestre. Il y a environ 3,8 milliards d'années, lors du grand bombardement tardif, de nombreux impacts d'astéroïdes causèrent alors d'importantes modifications de sa surface.<br>La Terre a pour particularité, du point de vue de l'être humain, d'être le seul endroit connu de l'univers à abriter la vie telle que nous la connaissons, comme la faune (dont entre autres l'espèce humaine) et la flore. Les cultures humaines ont développé de nombreuses représentations de la planète, dont une personnification en tant que déité, la croyance en une terre plate, la Terre en tant que centre de l'univers et la perspective moderne d'un monde en tant que système global nécessitant une gestion raisonnable.<br>La science qui étudie la Terre est la géologie. Compte tenu de l'influence de la vie sur la composition de l'atmosphère, des océans et des roches sédimentaires, la géologie emprunte à la biologie une partie de sa chronologie et de son vocabulaire.<h4><a href='http://creativecommons.org/licenses/by-sa/3.0/deed.fr'>Contenu soumis à la licence CC-BY-SA</a>. Source : Article <em><a href='http://fr.wikipedia.org/wiki/Terre'>Terre</a></em> de <a href='http://fr.wikipedia.org/'>Wikipédia en français</a> (<a href='http://fr.wikipedia.org/w/index.php?title=Terre&action=history'>auteurs</a>)</h4>",
         10:"La Lune, ou Terre I, est l'unique satellite naturel de la Terre. Elle est le cinquième plus grand satellite du Système solaire, avec un diamètre moyen de 3 474 km. La distance moyenne séparant la Terre de la Lune est de 381 500 km3.<br>La Lune est le premier et, à ce jour (2019), le seul objet non terrestre visité par l'Homme. Le premier à y avoir marché est l'astronaute américain Neil Armstrong le 21 juillet 1969. Après lui, onze autres hommes ont foulé le sol de la Lune, tous membres du programme Apollo.",
         1:"Mercure est la planète la plus proche du Soleil et la moins massive du Système solaire1. Son éloignement au Soleil est compris entre 0,31 et 0,47 unité astronomique (46 et 70 millions de kilomètres), ce qui correspond à une excentricité orbitale de 0,2 — plus de douze fois supérieure à celle de la Terre, et de loin la plus élevée pour une planète du système solaire. Elle est visible à l'œil nu depuis la Terre avec un diamètre apparent de 4,5 à 13 secondes d'arc, et une magnitude apparente de 5,7 à −2,3 ; son observation est toutefois rendue difficile par son élongation toujours inférieure à 28,3° qui la noie le plus souvent dans l'éclat du Soleil.<br>Mercure a la particularité d'être en résonance sur son orbite, sa période de révolution (~88 jours) valant exactement 1,5 fois sa période de rotation (~59 jours), et donc la moitié d'un jour solaire (~176 jours).<br>Mercure est une planète tellurique, comme le sont également Vénus, la Terre et Mars. Elle est près de trois fois plus petite et presque vingt fois moins massive que la Terre mais presque aussi dense qu'elle, avec une gravité de surface pratiquement égale à celle de Mars, qui est pourtant près de deux fois plus massive. Sa densité remarquable — dépassée seulement par celle de la Terre, qui lui serait d'ailleurs inférieure sans l'effet de la compression gravitationnelle — est due à l'importance de son noyau métallique, qui occuperait plus de 40 % de son volume, contre seulement 17 % pour la Terre.<br>Comme Vénus, Mercure est quasiment sphérique — son aplatissement pouvant être considéré comme nul — en raison de sa rotation très lente. Dépourvue de véritable atmosphère, sa surface est très fortement cratérisée, et globalement similaire à la face cachée de la Lune. Seules deux sondes spatiales ont étudié Mercure. Mariner 10, qui a survolé à trois reprises la planète en 1974–1975, a cartographié 45 % de sa surface et découvert son champ magnétique. La sonde Messenger, après trois survols en 2008-2009, s'est mise en orbite autour de Mercure en mars 2011 et a entamé une étude détaillée notamment de sa topographie, son histoire géologique, son champ magnétique et son exosphère.<br>La quasi-absence d'atmosphère — il s'agit en fait d'une exosphère exerçant une pression au sol de l'ordre d'1 nPa (10−14 atm) — combinée à la proximité du Soleil — dont l'irradiance à la surface de Mercure varie entre 4,6 et 10,6 fois la constante solaire (soit 12 300 W/m2 de surface mercurienne) — engendre des températures en surface allant de 90 K (−183 °C) au fond des cratères polaires (là où les rayons du Soleil ne parviennent jamais) jusqu'à 700 K (427 °C) au point subsolaire au périhélie.<br>La planète Mercure doit son nom au dieu Mercure du commerce et des voyages, également messager des autres dieux dans la mythologie romaine. La planète a été nommée ainsi par les Romains à cause de la vitesse à laquelle elle se déplaçait2. Le symbole astronomique de Mercure est un cercle posé sur une croix et portant un demi-cercle en forme de cornes (Unicode : ☿). C'est une représentation du caducée du dieu Hermès. Mercure laissa également son nom au troisième jour de la semaine, mercredi (« Mercurii dies »).",
         0:"Le Soleil est l’étoile du Système solaire. Dans la classification astronomique, c’est une étoile de type naine jaune d'une masse d'environ 1,9891 × 1030 kg, composée d’hydrogène (75 % de la masse ou 92 % du volume) et d’hélium (25 % de la masse ou 8 % du volume)9. Le Soleil fait partie de la galaxie appelée la Voie lactée et se situe à environ 8 kpc (∼26 100 a.l.) du centre galactique, dans le bras d'Orion. Le Soleil orbite autour du centre galactique en 225 à 250 millions d'années (année galactique). Autour de lui gravitent la Terre (à la vitesse de 30 km/s), sept autres planètes, au moins cinq planètes naines, de très nombreux astéroïdes et comètes et une bande de poussière. Le Soleil représente à lui seul environ 99,854 % de la masse du Système solaire ainsi constitué, Jupiter représentant plus des deux tiers du reste.<br>L’énergie solaire transmise par le rayonnement solaire rend possible la vie sur Terre par apport d'énergie lumineuse (lumière) et d'énergie thermique (chaleur), permettant la présence d’eau à l’état liquide et la photosynthèse des végétaux. Les UV solaires contribuent à la désinfection naturelle des eaux de surfaces et à y détruire certaines molécules indésirables (quand l'eau n'est pas trop turbide)10. La polarisation naturelle de la lumière solaire (y compris de nuit après diffusion ou réflexion, par la Lune) ou par des matériaux tels que l’eau ou les cuticules végétales est utilisée par de nombreuses espèces pour s’orienter.<br>Le rayonnement solaire est aussi responsable des climats et de la plupart des phénomènes météorologiques observés sur la Terre. En effet, le bilan radiatif global de la Terre est tel que la densité thermique à la surface de la Terre est en moyenne à 99,97 % ou 99,98 % d’origine solairenote 1. Comme pour tous les autres corps, ces flux thermiques sont continuellement émis dans l’espace, sous forme de rayonnement thermique infrarouge ; la Terre restant ainsi en « équilibre dynamique ».<br>Le demi-grand axe de l’orbite de la Terre autour du Soleil, couramment appelé « distance de la Terre au Soleil », égal à 149 597 870 700 m ± 3 m1, est la définition originale de l’unité astronomique (ua). Il faut 8 minutes et 19 secondes pour que la lumière du Soleil parvienne jusqu’à la Terre11.<br>Le symbole astronomique et astrologique du Soleil est un cercle avec un point en son centre : {\displaystyle \odot } \odot.",
        4:"Mars (prononcé en français : /maʁs/) est la quatrième planète par ordre de distance croissante au Soleil et la deuxième par masse et par taille croissantes. Son éloignement au Soleil est compris entre 1,381 et 1,666 UA (206,6 à 249,2 millions de kilomètres), avec une période orbitale de 669,58 jours martiens (686,71 jours terrestres).<br>C’est une planète tellurique, comme le sont Mercure, Vénus et la Terre, environ dix fois moins massive que la Terre mais dix fois plus massive que la Lune. Sa topographie présente des analogies aussi bien avec la Lune, à travers ses cratères et ses bassins d'impact, qu'avec la Terre, avec des formations d'origine tectonique et climatique telles que des volcans, des rifts, des vallées, des mesas, des champs de dunes et des calottes polaires. La plus grande montagne du Système solaire, Olympus Mons (qui est aussi un volcan bouclier), et le plus grand canyon, Valles Marineris, se trouvent sur Mars.<br>Mars a aujourd'hui perdu la presque totalité de son activité géologique interne, et seuls des événements mineurs surviendraient encore épisodiquement à sa surface, tels que des glissements de terrain, sans doute des geysers de CO2 dans les régions polaires, peut-être des séismes, voire de rares éruptions volcaniques sous forme de petites coulées de lave3.<br>La période de rotation de Mars est du même ordre que celle de la Terre et son obliquité lui confère un cycle des saisons similaire à celui que nous connaissons ; ces saisons sont toutefois marquées par une excentricité orbitale cinq fois et demie plus élevée que celle de la Terre, d'où une asymétrie saisonnière sensiblement plus prononcée entre les deux hémisphères.<br>Mars peut être observée à l’œil nu, avec un éclat bien plus faible que celui de Vénus mais qui peut, lors d'oppositions rapprochées, dépasser l'éclat maximum de Jupiter, atteignant une magnitude apparente de -2,914, tandis que son diamètre apparent varie de 25,1 à 3,5 secondes d'arc selon que sa distance à la Terre varie de 55,7 à 401,3 millions de kilomètres. Mars a toujours été caractérisée visuellement par sa couleur rouge, due à l'abondance de l'hématite amorphe — oxyde de fer(III) — à sa surface. C'est ce qui l'a fait associer à la guerre depuis l'Antiquité, d'où son nom en Occident d'après le dieu Mars de la guerre dans la mythologie romaine, assimilé au dieu Arès de la mythologie grecque. En français, Mars est souvent surnommée « la planète rouge » en raison de cette couleur particulière.<br>Avant le survol de Mars par Mariner 4 en 1965, on pensait qu'il s'y trouvait de l'eau liquide en surface et que des formes de vie similaires à celles existant sur Terre pouvaient s'y être développées, thème très fécond en science-fiction. Les variations saisonnières d'albédo à la surface de la planète étaient attribuées à de la végétation, tandis que des formations rectilignes perçues dans les lunettes astronomiques et les télescopes de l'époque étaient interprétées, notamment par l'astronome amateur américain Percival Lowell, comme des canaux d'irrigation traversant des étendues désertiques avec de l'eau issue des calottes polaires. Toutes ces spéculations ont été balayées par les sondes spatiales qui ont étudié Mars : dès 1965, Mariner 4 permit de découvrir une planète dépourvue de champ magnétique global, avec une surface cratérisée rappelant celle de la Lune, et une atmosphère ténue.<br>Depuis lors, Mars fait l'objet de programmes d'exploration plus ambitieux que pour aucun autre objet du Système solaire : de tous les astres que nous connaissons, c'est en effet celui qui présente l'environnement ayant le plus de similitudes avec celui de notre planète. Cette exploration intensive nous a apporté une bien meilleure compréhension de l'histoire géologique martienne, révélant notamment l'existence d'une époque reculée — le Noachien — où les conditions en surface devaient être assez similaires à celles de la Terre à la même époque, avec la présence de grandes quantités d'eau liquide ; la sonde Phoenix a ainsi découvert à l'été 2008 de la glace d'eau à une faible profondeur dans le sol de Vastitas Borealis.<br>Mars possède deux petits satellites naturels, Phobos et Déimos.",
         2:"Vénus est une des quatre planètes telluriques du Système solaire. Elle est la deuxième planète par ordre d'éloignement au Soleil, et la sixième par masse ou par taille décroissantes.<br>La planète Vénus a été baptisée du nom de la déesse Vénus de la mythologie romaine.La distance de Vénus au Soleil est comprise entre 0,718 et 0,728 UA, avec une période orbitale de 224,7 jours. Vénus est une planète tellurique, comme le sont également Mercure, la Terre et Mars. Elle possède un champ magnétique très faible et n'a aucun satellite naturel. Elle et Uranus sont les deux seules planètes du Système solaire dont la rotation est rétrograde. Elle est la seule ayant une période de rotation (243 jours) supérieure à sa période de révolution. Vénus présente en outre la particularité d'être quasiment sphérique — son aplatissement peut être considéré comme nul — et de parcourir l'orbite la plus circulaire des planètes du Système solaire, avec une excentricité orbitale de 0,0068 (contre 0,0167 pour la Terre).<br>Vénus est presque aussi grande que la Terre — son diamètre représente 95 % de celui de notre planète — et a une masse équivalente aux quatre cinquièmes de celle de la Terre. Sa surface est dissimulée sous d'épaisses couches de nuages très réfléchissants qui lui confèrent un albédo de Bond de 0,75 et une magnitude apparente dans le ciel pouvant atteindre -4,6, valeur dépassée uniquement par la Lune et le Soleil. Étant plus proche du Soleil que la Terre, elle présente des phases au même titre que la Lune et Mercure selon sa position relative par rapport au Soleil et à la Terre, son élongation ne dépassant jamais 47,8°.<br>L'atmosphère de Vénus est la plus épaisse de celle de toutes les planètes telluriques, avec une pression au sol atteignant 9,3 MPa (91,8 atm) au niveau de référence des altitudes vénusiennes. Cette atmosphère est composée d'environ 96,5 % de dioxyde de carbone et 3,5 % d'azote, avec de faibles concentrations de dioxyde de soufre et de divers autres gaz. Elle contient d'épaisses couches nuageuses opaques constituées de gouttelettes de dioxyde de soufre et d'acide sulfurique surmontées d'une brume de cristaux de glace d'eau qui donne à la planète son aspect laiteux lorsqu'on l'observe depuis l'espace. Ces nuages réfléchissent l'essentiel du rayonnement solaire, de sorte que la puissance solaire parvenant au sol sur Vénus représente moins de 45 % de celle reçue au sol sur Terre, et est même inférieure d'un quart à celle reçue à la surface de la planète Mars.<br>L'atmosphère de Vénus est près de cent fois plus massive que celle de la Terre et possède une dynamique propre, indépendante de la planète elle-même, avec une super-rotation dans le sens rétrograde en quatre jours terrestres, ce qui correspond à une vitesse linéaire au sommet des nuages d'environ 100 m/s (360 km/h) par rapport au sol. Compte tenu de sa composition et de sa structure, cette atmosphère génère un très puissant effet de serre à l'origine des températures les plus élevées mesurées à la surface d'une planète du Système solaire : près de 740 K (environ 467 °C) en moyenne à la surface — supérieures à celles de Mercure, pourtant plus proche encore du Soleil, où les températures culminent à 700 K (environ 427 °C) — et ceci bien que l'atmosphère ne laisse passer que le quart de l'énergie solaire incidente.<br>À cette pression (9,3 MPa) et à cette température (740 K), le CO2 n'est plus un gaz, mais un fluide supercritique (intermédiaire entre un gaz et un liquide), d'une masse volumique voisine de 65 kg/m3.<br>La topographie de Vénus présente peu de reliefs élevés, et consiste essentiellement en de vastes plaines a priori volcaniques géologiquement très jeunes — quelques centaines de millions d'années tout au plus. De très nombreux volcans ont été identifiés à sa surface — mais sans véritables coulées de lave, ce qui constitue une énigme — ainsi que des formations géologiques, parfois uniques dans le Système solaire telles que coronae, arachnoïdes et farra, attribuées à des manifestations atypiques de volcanisme. En l'absence de tectonique des plaques identifiée à la surface de la planète, on pense que Vénus évacue sa chaleur interne périodiquement lors d'éruptions volcaniques massives qui remodèlent entièrement sa surface, ce qui expliquerait que celle-ci soit si récente. Entre ces épisodes de volcanisme global, le refroidissement de la planète serait trop lent pour entretenir un gradient thermique suffisant dans la phase liquide du noyau pour générer un champ magnétique global par effet dynamo.<br>Par ailleurs, des mesures d'émissivité à 1,18 µm réalisées en 20083 ont suggéré une relative abondance des granites et autres roches felsiques sur les terrains les plus élevés — qui sont généralement les plus anciens — de la planète, ce qui impliquerait l'existence passée d'un océan global assorti d'un mécanisme de recyclage de l'eau dans le manteau susceptible d'avoir produit de telles roches. À l'instar de Mars, Vénus aurait ainsi peut-être connu, il y a plusieurs milliards d'années, des conditions tempérées permettant l'existence d'eau liquide en surface, eau aujourd'hui disparue — par évaporation puis dissociation photochimique dans la haute atmosphère — au point de faire de cette planète l'une des plus sèches du Système solaire.<br>La planète Vénus a été baptisée du nom de la déesse Vénus de la féminité et de l'amour physique dans la mythologie romaine. Elle était déjà connue des Babyloniens à l'Âge du bronze, associée à la déesse Ishtar de la mythologie mésopotamienne.",
         5:"Jupiter est une planète géante gazeusea. Il s'agit de la plus grosse planète du Système solaire, plus volumineuse et massive que toutes les autres planètes réunies, et la cinquième planète par sa distance au Soleil (après Mercure, Vénus, la Terre et Mars).<br>Jupiter est ainsi officiellement désignée1, en français comme en anglaisb, d'après le dieu romain Jupiter2, assimilé au dieu grec Zeus.<br>Le symbole astronomique de la planète était « ♃ », qui serait une représentation stylisée du foudre de Jupiter, ou bien serait dérivé d'un hiéroglyphe3 ou, comme cela ressortirait de certains papyrus d'Oxyrhynque4, de la lettre grecque zêta, initiale du grec ancien Ζεύς (Zeús). L'Union astronomique internationale recommande de substituer au symbole astronomique « ♃ » l'abréviation « J », correspondant à la lettre capitale J de l'alphabet latin, initiale de l'anglais Jupiter5.<br>Visible à l'œil nu dans le ciel nocturne, Jupiter est habituellement le quatrième objet le plus brillant de la voûte céleste, après le Soleil, la Lune et Vénus6. Parfois, Mars apparaît plus lumineuse que Jupiter et, de temps en temps, Jupiter apparaît plus lumineuse que Vénus7. Jupiter était au périhélie le 17 mars 20118 et à l'aphélie le 17 février 20179.<br>Comme sur les autres planètes gazeuses, des vents violents, de près de 600 km/h, parcourent les couches supérieures de la planète. La Grande Tache rouge est un anticyclone, une zone de surpression observée depuis au moins le xviie siècle. Trois fois plus grande que la Terre au début du xxe siècle, elle a rétréci pour devenir de taille comparable un siècle plus tard.<br>Regroupant Jupiter et les objets se trouvant dans sa sphère d'influence, le système jovien est une composante majeure du Système solaire externe. Il comprend notamment les nombreuses lunes de Jupiter dont les quatre lunes galiléennes — Io, Europe, Ganymède et Callisto — qui, observées pour la première fois en 1610 par Galilée au moyen d'une lunette astronomique de son invention, sont les premiers objets découverts par l'astronomie télescopique. Il comprend aussi les anneaux de Jupiter, un système d'anneaux planétaires observés pour la première fois, en 1979, par la sonde spatiale américaine Voyager 1.<br>L'influence de Jupiter s'étend, au-delà du système jovien, à de nombreux objets dont les astéroïdes troyens de Jupiter.<br>La masse jovienne est une unité utilisée pour exprimer la masse d'objets substellaires tels que les naines brunes.<h4><a href='http://creativecommons.org/licenses/by-sa/3.0/deed.fr'>Contenu soumis à la licence CC-BY-SA</a>. Source : Article <em><a href='http://fr.wikipedia.org/wiki/Jupiter_(plan%C3%A8te)'>Jupiter (planète)</a></em> de <a href='http://fr.wikipedia.org/'>Wikipédia en français</a> (<a href='http://fr.wikipedia.org/w/index.php?title=Jupiter_(plan%C3%A8te)&action=history'>auteurs</a>)</h4>",
         7:"Uranus est la 7e planète du Système solaire par sa distance au Soleil, la 3e par la taille et la 4e par la masse. Elle doit son nom à la divinité romaine du ciel Uranus, père de Saturne et grand-père de Jupiter, noms que portent les deux planètes la précédant dans le Système solaire.<br>Uranus est la première planète découverte à l’époque moderne. Bien qu'elle soit visible à l’œil nu comme les cinq planètes déjà connues, son caractère planétaire ne fut pas identifié en raison de son très faible éclat (à la limite de la visibilité) et de son déplacement apparent très lent. William Herschel annonce sa découverte le 26 avril 1781, élargissant les frontières connues du Système solaire pour la première fois à l’époque moderne. Uranus est la première planète découverte à l’aide d’un télescope.<br>Uranus est une planète géante, et plus précisément une planète géante de glaces. Après la découverte de nombreuses géantes parmi les exoplanètes, différents types ont été distingués : Uranus est de type Neptune froid. Uranus et Neptune ont des compositions internes et atmosphériques différentes de celles des deux plus grandes géantes gazeuses, Jupiter et Saturne. Les astronomes les placent donc de nos jours généralement dans une catégorie différente, celle des géantes glacées ou des sous-géantes. L’atmosphère d’Uranus, bien que composée principalement d’hydrogène et d’hélium, contient une proportion plus importante de glaces d’eau, d’ammoniac et de méthane, ainsi que les traces habituelles d’hydrocarbures. Uranus est la planète du Système solaire dont l’atmosphère est la plus froide, sa température minimale étant de 49 K (−224 °C), à la tropopause (vers 56 km d'altitude et 0,1 bar, le niveau zéro étant défini à une pression d'un bar).<br>À l’instar des autres géantes gazeuses, Uranus a un système d’anneaux, une magnétosphère et de nombreux satellites naturels. Il y a 27 satellites et 13 anneaux étroits. Le système uranien est unique dans le Système solaire car son axe de rotation est pratiquement dans son plan de révolution autour du Soleil ; la planète est pourvue d'un champ magnétique dont les pôles nord et sud sont inclinés à 60° par rapport à l'axe de rotation. En 1986, les images de Voyager 2 ont montré Uranus comme une planète sans caractéristique particulière en lumière visible. Cette visite de la sonde se produisit près du solstice, l'hémisphère éclairé était alors principalement son hémisphère austral. En 2017, au printemps boréal d'Uranus, le télescope Keck II montre des bandes nuageuses en infra-rouge. On y remarque des mouvements de nuages, des vents à 900 km/h, d'énormes ouragans et des ondulations étranges en forme de tresse cerclant la planète.<br>Cependant, les observateurs terrestres ainsi que le télescope spatial Hubble ont depuis constaté des signes de changements saisonniers et une augmentation de l’activité météorologique lorsqu'Uranus a approché de son équinoxe, atteint le 8 décembre 2007.",
         8:"Neptune est la huitième et dernière planète du Système solaire par distance croissante au Soleil.<br>Neptune orbite autour du Soleil à une distance d'environ 30 UA, avec une excentricité orbitale moitié moindre que celle de la Terre, en bouclant une révolution complète en 164,79 ans. C'est la troisième planète du Système solaire par masse décroissante — elle est 17 fois plus massive que la Terre et 19 fois moins massive que Jupiter — et la quatrième par taille décroissante : Neptune est en effet à la fois un peu plus massive mais un peu plus petite qu'Uranus.<br>Neptune et Uranus, toutes les deux des géantes de glaces et plus précisément des planètes de type Neptune froid, ont une composition similaire, différente de celle des deux autres planètes géantes, Jupiter et Saturne, qui sont des géantes gazeuses de type Jupiter froid. Comme ces dernières, l'atmosphère de Neptune est principalement constituée d'hydrogène et d'hélium avec des traces d'hydrocarbures et peut-être d'azote, mais contiendrait davantage de « glaces » au sens astrophysique, c'est-à-dire de composés volatils tels que l'eau, l'ammoniac et le méthane. Ce dernier est d'ailleurs partiellement responsable de la teinte bleue de l'atmosphère de Neptune, bien que l'origine de ce bleu très soutenu reste encore inexpliquée.<br>Neptune est le premier objet et la seule des huit planètes du système solaire à avoir été découverte par déduction grâce au calcul avant l'observation directe. L'astronome français Alexis Bouvard avait noté des perturbations inexpliquées sur l'orbite d'Uranus et conjecturé au début du xixe siècle qu'une huitième planète, plus lointaine, pouvait en être la cause. Les astronomes britannique John Couch Adams en 1843 et français Urbain Le Verrier en 1846, calculèrent chacun de leur côté, et par des méthodes différentes, la position prévisible de cette hypothétique planète, qui fut observée le 23 septembre 1846 par l'astronome allemand Johann Gottfried Galle, à 1° de la position alors calculée par Le Verrier, et à 12° de celle calculée par Adams.<br>Le nom de cette huitième planète vient de Neptune, le dieu des océans dans la mythologie romaine. Son symbole astronomique Symbole astronomique de Neptune. est une version stylisée du trident du dieu Neptune, tandis que son symbole alternatif Symbole astronomique alternatif de Neptune. représente les initiales de Le Verrier.",
         9:"Pluton, officiellement désignée par (134340) Pluton (désignation internationale : (134340) Pluto), est une planète naine, la plus volumineuse connue dans le Système solaire (2 372 km de diamètre, contre 2 326 km pour Éris), et la deuxième en termes de masse (après Éris). Pluton est ainsi le neuvième plus gros objet connu orbitant autour du Soleil (exception faite des lunes des géantes gazeuses) et le dixième par la masse. Premier objet transneptunien identifié, Pluton orbite autour du Soleil à une distance variant entre 30 et 49 unités astronomiques et appartient à la ceinture de Kuiper, ceinture dont il est (tant par la taille que par la masse) le plus grand membre connu.<br>Après sa découverte par l'astronome américain Clyde Tombaugh en 1930, Pluton était considérée comme la neuvième planète du Système solaire. À la fin du xxe siècle et au début du xxie siècle, de plus en plus d'objets similaires furent découverts dans le Système solaire externe, en particulier Éris, alors estimé légèrement plus grand et plus massif que Pluton. Cette évolution amena l'Union astronomique internationale (UAI) à redéfinir la notion de planète, Cérès, Pluton et Éris étant depuis le 24 août 2006 classées comme des planètes naines. L'UAI a également décidé de faire de Pluton le prototype d'une nouvelle catégorie d'objet transneptunien. À la suite de cette modification de la nomenclature, Pluton a été ajoutée à la liste des objets mineurs du Système solaire et s'est vu attribuer le numéro 134340 dans le catalogue des objets mineurs.<br>Pluton est principalement composée de roche et de glace de méthane, mais aussi de glace d'eau et d'azote gelé. Son diamètre est d'environ les deux tiers de celui de la Lune.<br>Pluton est le corps principal du système plutonien. Le couple que forme Pluton avec son grand satellite, Charon (diamètre 1 207 km), est souvent considéré comme un système double, car la différence de masse entre les deux objets est l'une des plus faibles de tous les couples corps primaire/satellite du système solaire (rapport 8 pour 1) et le barycentre de leurs orbites ne se situe pas à l'intérieur d'un des deux corps (il est légèrement à l'extérieur de Pluton).<br>Quatre autres satellites naturels, nettement plus petits et tous en orbite à peu près circulaires (excentricité < 0,006) à l'extérieur de l'orbite de Charon, complètent le système tel qu'actuellement connu (dans l'ordre en s'éloignant) : Styx, Nix, Kerbéros et Hydre. Tous quatre furent découverts avec l'aide du télescope spatial Hubble : les deux plus importants, Nix et Hydre (respectivement 54 × 41 × 36 km et 43 × 33 km), en 2005, Kerbéros (environ 12 × 4 km) en 2011 et Styx (environ 7 × 5 km) en 2012. Ces deux derniers ont reçu leur nom officiel en juillet 2013. Les dimensions mentionnées correspondent à des mesures effectuées ultérieurement à leur découverte, et non aux premières estimations qui purent être faites.<br>La sonde spatiale New Horizons, lancée en janvier 2006 par la NASA, est la première sonde à explorer le système plutonien ; elle le traverse le 14 juillet 2015 à une distance minimale de 11 095 km de Pluton, après un voyage de 6,4 milliards de kilomètres. La sonde ne détecte aucun autre satellite de plus d'1,7 kilomètre de diamètre pour un albédo de 0,5.<br><br><h4><a href='http://creativecommons.org/licenses/by-sa/3.0/deed.fr'>Contenu soumis à la licence CC-BY-SA</a>. Source : Article <em><a href='http://fr.wikipedia.org/wiki/Pluton_(plan%C3%A8te_naine)'>Pluton (planète naine)</a></em> de <a href='http://fr.wikipedia.org/'>Wikipédia en français</a> (<a href='http://fr.wikipedia.org/w/index.php?title=Pluton_(plan%C3%A8te_naine)&action=history'>auteurs</a>)<h4>"}]
)})
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require('d3@v5')
)})
    },
    {
      name: "d3tip",
      inputs: ["require"],
      value: (function(require){return(
require("https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.9.1/d3-tip.js")
)})
    },
    {
      name: "css",
      value: (function(){return(
import("https://use.fontawesome.com/releases/v5.7.2/js/all.js")
)})
    },
    {
      name: "epAnim",
      inputs: ["font5x7","d3"],
      value: (function(font5x7,d3){return(
class epAnim {

  constructor (param,message) {
    this.param = param;
    this.message=message;
    this.lettre=[];
    this.data=[];
    this.param.nbC = this.message.length;
    // nouvelle option
    this.param.espace = Math.trunc((this.param.ech-1)/4)+1;
    this.param.pixel = this.param.ech*2+this.param.espace;
    this.param.nbL = Math.trunc(this.param.width / (this.param.pixel*6)); // nb possible de caractères par Ligne
    this.param.ligne = Math.trunc(this.param.nbC/this.param.nbL+.999); // nb de ligne
    this.param.cesure = Math.round(this.param.nbC / this.param.ligne + .49); // nb de caratcères par ligne au final
    this.param.hL = (this.param.pixel*8);
    this.param.hauteur = this.param.ligne*this.param.hL;
    if (this.param.height <= this.param.hauteur) {this.param.height = this.param.hauteur +4;}
    this.set_origine(Math.trunc(this.param.width-this.param.cesure*this.param.pixel*6)/2 +this.param.pixel+this.param.x,Math.trunc((this.param.height-this.param.hauteur)/(2))+this.param.pixel+this.param.y);
  }
  set_origine(xo,yo) {
    this.param.xo=xo;
    this.param.yo=yo;
  }
  decode() {
    let d=[];
    for (var l in this.message) {
      this.decode_lettre(this.message[l],d,l);
    }
    return d;
  }
  decode_lettre(l,d,o) { // l= la lettre à décoder, d : la matrice ou pusher o: offset de la lettre
    let i = font5x7[0][l];
    for (var j=0;j<i.length;j++) {
      let l=[];
      for (var k=0;k<7;k++) {
        let v = i[j] & (1<<k);
        let lig = Math.trunc(o/this.param.cesure); //(o<param.cesure) ? 0 : 1;
        if (v!=0) { l.push(k+lig*this.param.hL/this.param.pixel,j+6*(o-lig*this.param.cesure),lig); d.push(l);l=[];}
      }
    }
  }
  //------------------------- on réparti les points un peu partout dans le carré [width x height]
  start() {
    this.data = this.lettre;
    for (var i=0; i<this.lettre.length;i++) {
      let x=Math.trunc(Math.random()*this.param.width) + this.param.x;
      let y=Math.trunc(Math.random()*this.param.height) + this.param.y;
      this.data[i].push(x,y);
    }
  }
  //------------------------- on initialise en décodant le message en font 5x7 et on disperse les pixels
  init() {
    this.lettre = this.decode();
    this.start();
    return this.data;
  }
  dessine(g,co) {
    if (this.param.bBG) // anime t on le BackGround
    {
      g.append('rect')
          .attr('x',this.param.x).attr('y',this.param.y)
          .attr('width',this.param.width)//-margin.left-margin.right)
          .attr('height',this.param.height)//-margin.top-margin.bottom)
          .attr('fill','black')
            .transition().duration(this.param.duree*1.3).attr('fill',this.param.cBG);
    }
    d3.selectAll('#Anim circle').remove();
    g.selectAll('circle').data(this.data).enter()
      .append('circle')
              .style('fill',d=>{return this.couleur[Math.trunc(Math.random()*5)];})
              .attr('cy',d=>{return d[4];})
              .attr('cx',d=>{return d[3];})
              .attr('r',d=> {return Math.trunc(Math.random()*5);})
            .transition().duration(this.param.duree)
              .ease(d3.easeBounce)
              .attr('transform','translate('+this.param.xo+','+this.param.yo+')')
              .attr('cy',d=>{return d[0]*this.param.pixel;})
              .attr('cx',d=>{return d[1]*this.param.pixel;})
              .attr('r',this.param.ech).style('fill',co);
  }
  
}
)})
    },
    {
      name: "font5x7",
      value: (function(){return(
[{E:[0x3e,0x49,0x49,0x49,0x41], C:[0x3e,0x41,0x41,0x41,0x22], O:[0x3e,0x41,0x41,0x41,0x3e],U:[0x3f,0x40,0x40,0x40,0x3f], '-':[0x0,0x8,0x8,0x8,0x0],R:[0x7E,0x9,0x19,0x29,0x46],I:[0x0,0x0,0x7F,0x0,0x0],K:[0x7F,0x8,0x14,0x22,0x40],Y:[0x3,0xC,0x70,0xC,0x3], ' ':[0,0,0,0,0], '/':[0x20,0x10,0x8,0x4,0x2],A:[0x7E,0x11,0x11,0x11,0x7E],B:[0x7F,0x49,0x49,0x49,0x36],D:[0x7F,0x41,0x41,0x42,0x3C],F:[0x7F,0x9,0x9,0x9,0x1],G:[0x3E,0x41,0x49,0x49,0x38],H:[0x7F,0x10,0x10,0x10,0x7F],J:[0x30,0x40,0x40,0x20,0x1F],L:[0x3F,0x40,0x40,0x40,0x40],M:[0x7F,0x2,0x4,0x2,0x7F],N:[0x7F,0x2,0xC,0x10,0x7F],P:[0x7F,0x9,0x9,0x9,0x6],Q:[0x3E,0x41,0x51,0x21,0x5E],S:[0x46,0x49,0x49,0x49,0x31],T:[0x1,0x1,0x7F,0x1,0x1],V:[0xF,0x30,0x40,0x30,0xF],W:[0x7F,0x20,0x18,0x20,0x7F],X:[0x63,0x14,0x8,0x14,0x63],Z:[0x61,0x51,0x49,0x45,0x43],'@':[0x0,0x38,0x44,0x28,0x0],'(':[0x0,0x0,0x3E,0x41,0x0],')':[0x0,0x41,0x3E,0x0,0x0],0:[0x1C,0x22,0x41,0x22,0x1C],1:[0x4,0x2,0x7F,0x0,0x0],2:[0x62,0x51,0x51,0x49,0x46],3:[0x22,0x41,0x49,0x49,0x36],4:[0x10,0x28,0x24,0x72,0x21],5:[0x27,0x49,0x49,0x49,0x31],6:[0x3E,0x49,0x49,0x49,0x30],7:[0x1,0x61,0x11,0xD,0x3],8:[0x36,0x49,0x49,0x49,0x36],9:[0x6,0x49,0x49,0x49,0x3E],o:[0x38,0x44,0x44,0x44,0x38],u:[0x3C,0x40,0x40,0x40,0x3C],c:[0x38,0x44,0x44,0x44,0x44],e:[0x38,0x54,0x54,0x54,0x8],a:[0x20,0x54,0x54,0x54,0x38],b:[0x3F,0x44,0x44,0x44,0x38],d:[0x38,0x44,0x44,0x44,0x3F],f:[0x0,0x7E,0x9,0x1,0x0],g:[0x0,0x26,0x49,0x49,0x3E],h:[0x0,0x7F,0x8,0x8,0x70],i:[0x0,0x0,0x7A,0x0,0x0],j:[0x0,0x20,0x40,0x3D,0x0],k:[0x0,0x7E,0x10,0x68,0x0],l:[0x0,0x2,0x3E,0x40,0x40],m:[0x7C,0x8,0x70,0x8,0x70],n:[0x0,0x7C,0x8,0x8,0x70],p:[0x0,0x7E,0x12,0x12,0xC],q:[0x0,0xC,0x12,0x12,0x7E],r:[0x4,0x78,0x4,0x4,0x8],s:[0x0,0x48,0x54,0x54,0x24],t:[0x0,0x3E,0x44,0x40,0x0],u:[0x3C,0x40,0x40,0x3C,0x40],v:[0xC,0x30,0x40,0x30,0xC],w:[0x1C,0x60,0x38,0x60,0x1C],x:[0x44,0x28,0x10,0x28,0x44],y:[0x26,0x48,0x48,0x3E,0x0],z:[0x64,0x54,0x54,0x4C,0x0],é:[0x38,0x54,0x56,0x55,0x8],è:[0x38,0x55,0x56,0x54,0x8]}]
)})
    },
    {
      name: "FontAwesome",
      inputs: ["html"],
      value: (function(html){return(
html`
<script defer src="https://use.fontawesome.com/releases/v5.0.12/js/all.js" integrity="sha384-Voup2lBiiyZYkRto2XWqbzxHXwzcm4A5RfdfG6466bu5LqjwwrjXCMBQBLMWh7qR" crossorigin="anonymous"></script>
`
)})
    }
  ]
};

const notebook = {
  id: "c9711c9c19ee579a@1450",
  modules: [m0]
};

export default notebook;
