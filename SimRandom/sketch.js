let canvas;
let slider;
let toggle;

let atoms;
let anz;
let runde;

let redraw = false;

function setup()
{
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  strokeWeight(1);
  noStroke();
  
  slider = createSlider(9, 50, 9);
  slider.addClass('slider');
  slider.changed(handleReset);

  resbtn = createButton('Neuer Start');
  resbtn.addClass('button');
  resbtn.mousePressed(handleReset);
    
  nextbtn = createButton('Nächste Runde');
  nextbtn.addClass('button');
  nextbtn.mousePressed(handleNext);
  
  toggle = createCheckbox('', false);
  toggle.addClass('toggle');
  toggle.changed(() => { redraw = true; });
  
  handleReset();
  windowResized();
}

function handleReset()
{
  runde = 0;
  atoms = [];
  anz = slider.value();
  for (let i=0; i<anz; i++) atoms.push(int(random(1,7)));
  redraw = true;
}

function handleNext()
{
  for (let i=0; i<anz; i++)
  {
    switch(atoms[runde*anz+i])
    {
      case -1: case 6: atoms.push(-1); break;
      default: atoms.push(int(random(1,7)));
    }
  }
  runde++;
  redraw = true;
}

function windowResized()
{
  let attempts = 5;              // über max. 5 Frames nachjustieren
  let lastW = -1, lastH = -1;    // nur bei Änderung wirklich resizen

  function fixSize()
  {
    const wi = windowWidth; const hi = windowHeight;
    if (wi !== lastW || hi !== lastH) { resizeCanvas(wi, hi); lastW = wi; lastH = hi; }
    
    resbtn.position(width*0.5, height*0.25);
    nextbtn.position(width*0.5, height*0.15);
    toggle.position(width*0.73, height*0.15);
    
    slider.position(width*0.5,height*0.1);
    slider.size(width*0.46);
    
    redraw = true;
    
    if (--attempts > 0) requestAnimationFrame(fixSize);
  }
  fixSize();
}

function draw()
{
  if (redraw)
  {  
    background(255);

    let d = height/anz;

    stroke(0);
    for (let i=0; i<anz; i++) 

    for (let j=0; j<=runde; j++)
    {
      let alive = 0;
      for(let i=0; i<anz; i++)
      {
        if (atoms[j*anz+i] != -1)
        {
          
          stroke(0); line((j-1/2)*width/20-d/2+d-d*2/20, (i+0.5)*d, (j+1/2)*width/20-d/2, (i+0.5)*d);
          cube((j+1/2)*width/20-d/2, i*d+d*1/20, d-d*2/20, atoms[j*anz+i]);
          alive++;
        }
      }
      if (toggle.checked())
      {
        noStroke();
        fill(0,255,0,200);
        rect((j+1/4)*width/20, height-d*alive, 2/4*width/20, d*alive);
      }
    }

    noStroke();
    fill(0);
    textSize(20);
    textAlign(CENTER, BOTTOM);
    text("Startzahl " + slider.value(), width*0.73, height*0.09);
    textAlign(LEFT, BOTTOM);
    text("Anzahl zeigen", width*0.73, height*0.24);
    textAlign(RIGHT, BOTTOM);
    fill(100); text("von C. Herting 2025", width-20, height-20); 
  
    redraw = false;
  }
}

function cube(x, y, d, val)
{
  if (val == -1) return;
  if (val == 6) fill(255,100,100); else fill(210, 210, 170);
  noStroke();
  rect(x, y, d, d, d/6);
  fill(0);
  switch(val)
  {
    case 0: break;
    case 1: circle(x+d/2, y+d/2, d/6); break;
    case 2: circle(x+d/4, y+d/4, d/6);
            circle(x+d*3/4, y+d*3/4, d/6); break;
    case 3: circle(x+d/4, y+d/4, d/6);
            circle(x+d/2, y+d/2, d/6);
            circle(x+d*3/4, y+d*3/4, d/6); break;
    case 4: circle(x+d/4, y+d/4, d/6);
            circle(x+d/4, y+d*3/4, d/6);
            circle(x+d*3/4, y+d/4, d/6);
            circle(x+d*3/4, y+d*3/4, d/6); break;
    case 5: circle(x+d/2, y+d/2, d/6);
            circle(x+d/4, y+d/4, d/6);
            circle(x+d/4, y+d*3/4, d/6);
            circle(x+d*3/4, y+d/4, d/6);
            circle(x+d*3/4, y+d*3/4, d/6); break;
    case 6: circle(x+d/4, y+d/2, d/6);
            circle(x+d*3/4, y+d/2, d/6);
            circle(x+d/4, y+d/4, d/6);
            circle(x+d/4, y+d*3/4, d/6);
            circle(x+d*3/4, y+d/4, d/6);
            circle(x+d*3/4, y+d*3/4, d/6); break;
  }
}

function mousePressed(ev)
{
  if (ev && ev.target !== canvas.elt) return;
}

function mouseReleased(ev)
{
  if (ev && ev.target !== canvas.elt) return;
}
