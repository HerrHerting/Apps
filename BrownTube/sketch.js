let canvas;
let w, h;
let screen, vorn;

let sliderE, sliderB, sliderU, sliderI, EBtn, BBtn;

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

  sliderI = createSlider(0, 3000, 0); // Beispielwerte
  sliderI.addClass('slider');
  
  sliderU = createSlider(5, 5000, 5); // Beispielwerte
  sliderU.addClass('slider');
  
  sliderE = createSlider(-5000, 5000, 0); // Beispielwerte
  sliderE.addClass('slider');

  sliderB = createSlider(-10000, 10000, 0); // Beispielwerte
  sliderB.addClass('slider');
  
  EBtn = createButton('Zero');
  EBtn.addClass('button');
  EBtn.mousePressed(() => sliderE.value(0));

  BBtn = createButton('Zero');
  BBtn.addClass('button');
  BBtn.mousePressed(() => sliderB.value(0));
   
  windowResized();
}

function windowResized()
{
  let attempts = 5;              // über max. 5 Frames nachjustieren
  let lastW = -1, lastH = -1;    // nur bei Änderung wirklich resizen

  function fixSize()
  {
    const wi = windowWidth; const hi = windowHeight;
    if (wi !== lastW || hi !== lastH) { resizeCanvas(wi, hi); lastW = wi; lastH = hi; }

    const a = screen.width / screen.height; // Aspect Ratio des Geräts
    if (a > width / height) { w = width; h = width / a; }
    else { w = height * a; h = height; }

    sliderI.position(w * 0.45, h * 0.045);
    sliderU.position(w * 0.45, h * 0.115);
    sliderE.position(w * 0.45, h * 0.185);
    sliderB.position(w * 0.45, h * 0.255);

    sliderI.size(w * 0.495);
    sliderU.size(w * 0.495);
    sliderE.size(w * 0.495);
    sliderB.size(w * 0.495);

    EBtn.position(w * 0.44 - EBtn.size().width, h * 0.185 - 13);
    BBtn.position(w * 0.44 - BBtn.size().width, h * 0.255 - 13);

    if (--attempts > 0) requestAnimationFrame(fixSize);
  }

  fixSize();
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
  
  text("Heizstrom " + nf(sliderI.value() / 1000, 1, 1) + "A", w*0.55, h*0.045);
  text("Beschleunigungsspannung "  + nf(sliderU.value(), 1, 0) + "V", w*0.55, h*0.115);
  text("Ablenkspannung "  + nf(sliderE.value(), 1, 0) + "V", w*0.55, h*0.185);
  text("Magnetfeld "  + nf(sliderB.value()/1000, 1, 2) + "mT", w*0.55, h*0.255);

  textAlign(RIGHT, BOTTOM);
  text("von C. Herting 2025", width-20, height-20); 
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

  strokeWeight(5); stroke(225,240,255,40);

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
      y-= vy / sqrt(ub/STEPSCALE);
      s--;
    } while(s>0);						// maximal s steps
  }
}
