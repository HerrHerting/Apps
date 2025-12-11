let canvas;
let radio;
let blip;

let kerne = [];
let radkerne = 0, zerkerne = 0;
let start = 0.0;
let messzeit = 120.0;

let readpoint = -100000.0;
let readtime = 0;
let readrad = 0;

function preload()
{
  radio = loadImage("radio.png");
  blip = loadSound('blip.wav');
}

function setup()
{
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  noStroke();
  
  btn = createButton('1000 radioaktive Kerne 120 Sekunden beobachten');
  btn.addClass('button');
  btn.mousePressed(() => { messzeit = 120.0; neueKerne(); });

  sbtn = createButton('1000 radioaktive Kerne 1 Sekunde beobachten');
  sbtn.addClass('button');
  sbtn.mousePressed(() => { messzeit = 1.0; neueKerne(); });

  abtn = createButton('Ablesen');
  abtn.addClass('button');
  abtn.mousePressed(() =>
  {
    if (radkerne > 0)
    {
      readpoint = millis();
      readtime = millis() - start;
      readrad = radkerne;
    }
  });
    
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

    btn.position(0.6*width, 0.15*height);
    sbtn.position(0.6*width, 0.30*height);
    abtn.position(0.6*width, 0.45*height);
    
    if (--attempts > 0) requestAnimationFrame(fixSize);
  }
  fixSize();
}

function neueKerne()
{
  kerne = [];
  radkerne = 1000; zerkerne = 0;
  for (let i=0; i<radkerne; i++) kerne.push(1);
  start = millis();
}

function draw()
{
  background(0);
  
  imageMode(CENTER);
  image(radio, height*0.325, height*0.325, height*(0.645 + 0.005*sin(millis()/1000.0*2*3.1415)), height*(0.645 + 0.005 * cos(millis()/720.0*2*3.1415)));
  
  textSize(50);
  textAlign(LEFT, BOTTOM);
  noStroke();
  
  fill(255,255,0, 150);
  rect(0,height*0.715, radkerne*width/1000, height*0.1);
  fill(0,255,0,150);
  rect(0,height*0.815, zerkerne*width/1000, height*0.1);
  fill(255);

  let zeit = (millis() - start)/1000.0;
  if (radkerne > 0)
  {
    text("Stoppuhr " + nf(min(zeit, messzeit), 1, 1) + "s", width*0.1, height*0.7);
    text("Messzeit " + nf(messzeit, 1, 1) +"s", width*0.6, height*0.7);
  }
  text(radkerne + " radioaktive Kerne ", width*0.1, height*0.8);
  text(zerkerne + " zerfallene Kerne ", width*0.1, height*0.9);
  
  textAlign(LEFT, TOP);
  fill(255 - min(255, (millis() - readpoint)*0.1));
  text(readrad + " Kerne", width*0.7, height*0.45);
    
  if (zeit < messzeit)
  {
    for (let i = 0; i < kerne.length; i++)
    {
      if (kerne[i] > 0)
      {
        if (random(50) < deltaTime/1000.0)
        {
          kerne[i] = 0;
          blip.play();
          zerkerne++;
          radkerne--;
        }
      }
    }
  }
    
  fill(255); textSize(20); textAlign(RIGHT, BOTTOM);
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
