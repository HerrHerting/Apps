let sliderE, sliderB, sliderU, sliderI;
let canvas;

let screen, vorn;

let a;

let w, h;

function preload()
{
  screen = loadImage("screen.png");
  vorn = loadImage("vorn.png");  
}

function setup()
{
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  noStroke();

/*
  let plusBtn = createButton('Down');
  plusBtn.position(30, 71);
  plusBtn.addClass('button');
  plusBtn.mousePressed(() => a = 0);

  let minusBtn = createButton('Up');
  minusBtn.position(30, 121);
  minusBtn.addClass('button');
  minusBtn.mousePressed(() => a = 1);
    
  let clearBtn = createButton('Clear');
  clearBtn.position(30, 171);
  clearBtn.addClass('button');
  clearBtn.mousePressed(() => a = 2);

  toggle = createCheckbox('', false);
  toggle.position(30, 226);
  toggle.addClass('toggle');
*/

  sliderI = createSlider(0, 3000, 0); // Beispielwerte
  sliderI.position(450, 30); // unterhalb des Toggles
  sliderI.addClass('slider');
  
  sliderU = createSlider(0, 5000, 0); // Beispielwerte
  sliderU.position(450, 80); // unterhalb des Toggles
  sliderU.addClass('slider');
  
  sliderE = createSlider(-5000, 5000, 0); // Beispielwerte
  sliderE.position(450, 130); // unterhalb des Toggles
  sliderE.addClass('slider');

  sliderB = createSlider(-10000, 10000, 0); // Beispielwerte
  sliderB.position(450, 180); // unterhalb des Toggles
  sliderB.addClass('slider');
  
  doDimensions();
}

function windowResized()
{
  let attempts = 5; // resize accross 5 frames to allow for the browser changing it's UI
  let lastW = -1; let lastH = -1; // resize only if dimensions change
  function fixSize()
  {
    const w = windowWidth; const h = windowHeight;
    if (w !== lastW || h !== lastH) { resizeCanvas(w, h); lastW = w; lastH = h; }
    if (--attempts > 0) requestAnimationFrame(fixSize);
  }
  requestAnimationFrame(fixSize); // start resizing in next animation frame
  doDimensions();
}

function doDimensions()
{
  w = width;
  h = height;
  let a = screen.width/screen.height; // aspect reation of screen
  if (a > width/height) { w = width; h = width/a; } else { w = height*a; h = height; }
}

function draw()
{
  background(161,179,234);
      
  image(screen, 0, 0, w, h);
  renderElectrons(sliderI.value()/3000*50,
                  sliderU.value(),
                  sliderE.value(),
                  sliderB.value()/1000000);
  image(vorn, 0, 0, w, h);
  
  textSize(20);
  textAlign(LEFT, BOTTOM);
  noStroke();

  fill(255);
  
  text("Heizstrom " + nf(sliderI.value() / 1000, 1, 1) + "A", 600, 30);
  text("Beschleunigungsspannung "  + nf(sliderU.value(), 1, 0) + "V", 600, 80);
  text("Ablenkspannung "  + nf(sliderE.value(), 1, 0) + "V", 600, 130);
  text("Magnetfeld "  + nf(sliderB.value()/1000, 1, 2) + "mT", 600, 180);

  textAlign(RIGHT, BOTTOM);
  text("von C. Herting 2025", w-20, h-20); 
}

function mousePressed(ev)
{
  if (ev && ev.target !== canvas.elt) return;
}

function mouseReleased(ev)
{
  if (ev && ev.target !== canvas.elt) return;
}

function renderElectrons(anz, ub, uy, tesla)
{
  let STEPSCALE = 500000; // für die Skalierung mit der Beschleunigungsspannung

  ub += 0.5;
  strokeWeight(5); stroke(225,240,255,30);

  for(let i=0; i<anz; i++)
  {
    let x = 843.0;	// 44.5 Pixel = 1m
    let y = 393.0 + random(-9,9);
    let vx = -1*0.002 * random(0,1); // in Pixel pro Picosekunde
    let vy = 2*0.002 * random(-0.5, 0.5);

    let s=100000;
    let oldx=-1, oldy=-1;
    do
    {
      let aktx = int(x);
      let akty = int(y);								// In welchem Pixel ist gerade das Elektron?
      if(aktx != oldx || akty != oldy)	// Zeichne den Pixel, wenn er neu ist
      {
        oldx=aktx; oldy=akty;
        if(aktx>=55 && aktx<1024 && akty>=0 && akty < 768)	// Zeichne nur innerhalb der bitmap
        {
          point(aktx/1024*w, (akty-18)/768*h);
        }
        else s=0; // Zeichne nur innerhalb der bitmap
      }

      let ax=0; let ay=0;

      if(aktx>=787) ax += - ub * 1.6022e-19 / 9.1095e-31 / (57/44.5*0.01) *44.5*100 * 1e-12 * 1e-12;						// Beschl. in Elektronenkanone
      else if(aktx>782) vx = -sqrt(2*1.6022e-19*ub/9.1095e-31) *44.5*100 * 1e-12;		// zur Sicherheit die korrekte E_kin vorgeben

      if(aktx <= 788 && aktx >= 782) if(akty>396 || akty <389) s=0;	// Blende?

      if(vx>0) if(aktx>700) s=0;

      if(aktx<=580 && aktx>=169)
      {
        if(akty > 516 || akty < 272) s=0;  // Knallt das Elektron auf die Platten?

        ay += uy * 1.602e-19 / 9.10095e-31 / (245/44.5*0.01) * 44.5*100 * 1e-12 * 1e-12;				// Beschl. im Plattenkondensator

        // Lorentz-Kraft im B-Feld
        let v = sqrt(vx*vx+vy*vy);
        let a = 1.602e-19*sqrt(2*1.6022e-19*ub/9.1095e-31)*tesla/9.1095e-31 * 44.5*100 * 1e-12 * 1e-12;
        ax -= a*vy/v;
        ay += a*vx/v;
      }

      vx+= ax / sqrt(ub/STEPSCALE);
      vy+= ay / sqrt(ub/STEPSCALE);
      x+= vx / sqrt(ub/STEPSCALE);		// Zeitschritt 1 Picosekunde / sqrt(ub/STEPSCALE)
      y+= vy / sqrt(ub/STEPSCALE);
      s--;
    } while(s>0);						// maximal s steps
  }
}
