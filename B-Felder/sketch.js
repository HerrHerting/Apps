let sys; // system holding charges / currents
let mode = '+'; // input mode

let mouseStartX = 0;
let mouseStartY = 0;
let mouseStartTime = 0;

let toggle;
let canvas;

function setup()
{
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  
  sys = new System();
  
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0);
  noStroke();

  let plusBtn = createButton('Down');
  plusBtn.position(30, 71);
  plusBtn.addClass('button');
  plusBtn.mousePressed(() => mode = '+');

  let minusBtn = createButton('Up');
  minusBtn.position(30, 121);
  minusBtn.addClass('button');
  minusBtn.mousePressed(() => mode = '-');
    
  let clearBtn = createButton('Clear');
  clearBtn.position(30, 171);
  clearBtn.addClass('button');
  clearBtn.mousePressed(() => sys.items = []);

  toggle = createCheckbox('', false);
  toggle.position(30, 226);
  toggle.addClass('toggle');
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
}

function draw()
{
  background(255);

  textSize(20);
  textAlign(LEFT, TOP);
  noStroke();

  fill(0); textStyle(BOLD); text("Kraftfeld elektrischer Ströme", 30, 30); textStyle(NORMAL);
  fill(0,255,255); text("Strom in die Ebene setzen/löschen", 100, 80);
  fill(255,0,0); text("Strom aus der Ebene setzen/löschen", 100, 130);
  fill(0);
  text("alle Ströme löschen", 100, 180);
  text("Feldlinien anzeigen", 100, 230);
  textAlign(RIGHT, BOTTOM);
  fill(200); 
  text("von C. Herting 2025", width-40, height-40); 

  if (mouseX > 126 || mouseY > 286)
  {
    noStroke(); fill(0,20); ellipse((mouseX & 0xffe0)+15, (mouseY & 0xffe0)+15, 32);
  }

  if (toggle.checked()) sys.showall();
  sys.render();
}

function mousePressed(ev)
{
  if (ev && ev.target !== canvas.elt) return;
  mouseStartX = mouseX;
  mouseStartY = mouseY;
  mouseStartTime = millis();
}

function mouseReleased(ev)
{
  if (ev && ev.target !== canvas.elt) return;
  let d = dist(mouseX, mouseY, mouseStartX, mouseStartY);
  let t = millis() - mouseStartTime;
  if ((mouseStartX > 126 || mouseStartY > 286) && d < 50 && t < 200)
  {
    if (mode == '+') sys.add((mouseX & 0xffe0)+15, (mouseY & 0xffe0)+15, 1);
    else sys.add((mouseX & 0xffe0)+15, (mouseY & 0xffe0)+15, -1);
  }
}

class System
{
  constructor()
  {
    this.items = [];
  }
  
  render()
  {
    noStroke();
    
    let fx=0; // Gesamtpfeil zur skalierten Darstellung
    let fy=0;
    let fak = 10000 / (sqrt(this.items.length));
    
    for(let i=this.items.length-1; i>=0; i--)
    {
      this.items[i].render();			
      
      let dx = mouseX-this.items[i].x;
      let dy = mouseY-this.items[i].y;
      let dst = (dx*dx + dy*dy);
      if(dst != 0)
      {
        let fx0 = this.items[i].q * dy / dst;
        let fy0 = - this.items[i].q * dx / dst;
        
        if (fx0!=0 || fy0!=0)
        {
          if (this.items[i].q > 0) stroke(0,255,255); else stroke(255,0,0);
          strokeWeight(2);
          arrow(mouseX, mouseY, mouseX + fak*fx0, mouseY + fak*fy0);
        }
      
        fx += fx0;
        fy += fy0;
      }
    }
        
    if (fx!=0 || fy!=0)
    {
      fill(0); noStroke();
      textAlign(LEFT, BOTTOM);
      textSize(10);
      text("Pfeillänge " + int(10000 * sqrt(fx*fx + fy*fy)), 40, height-40); 
      
      stroke(0,0,255); strokeWeight(4);
      arrow(mouseX, mouseY, mouseX + fak*fx, mouseY + fak*fy);
    }
  }
  
  showall()
  {
    if (this.items.length > 0)
    {
      stroke(200);

      for(let y=15; y<height; y+=32)
      {
        for(let x=15; x<width; x+=32)
        {
          let fx=0;
          let fy=0;
          
          for(let i=this.items.length-1; i>=0; i--)
          {
            let dx = x - this.items[i].x;
            let dy = y - this.items[i].y;
            let dst = (dx*dx + dy*dy);
            if(dst != 0)
            {
              fx += this.items[i].q * dy / dst;
              fy -= this.items[i].q * dx / dst;
            }
          }
          
          let l = sqrt(fx*fx + fy*fy);
          if (l != 0)
          {
            strokeWeight(400*l/sqrt(this.items.length));
            line(x-8*fx/l, y-8*fy/l, x+8*fx/l, y+8*fy/l);
          }
        }
      }
    }
  }
  
  add(x, y, q)
  {
    let exists = false;

    for(let i=this.items.length-1; i>=0; i--)
    {
      if(x == this.items[i].x && y == this.items[i].y)
      {
        exists = true;
        if (this.items[i].q == q ) this.items.splice(i,1);
        else this.items[i].q = q;
      }
    }
    
    if (exists == false) this.items.push(new Item(x, y, q));
  }
}

class Item
{
  constructor(x, y, q)
  {
    this.x = x;
    this.y = y;
    this.q = q;
  }

  render()
  {
    noStroke();
    if (this.q > 0) fill(0,255,255,127); else fill(255,0,0,127);
    ellipse(this.x, this.y, 32);

    fill(0);
    if (this.q > 0)
    {
      stroke(0);
      strokeWeight(2);
      line(this.x-10, this.y-10, this.x+10, this.y+10);
      line(this.x-10, this.y+10, this.x+10, this.y-10);
    }
    else ellipse(this.x, this.y, 5);
  }
}		

function arrow(sx, sy, zx, zy)
{
  let vx = zx - sx;
  let vy = zy - sy;
  let px = -vy;
  let py = vx;
  line(sx, sy, sx+0.75*vx, sy+0.75*vy);
  line(sx+0.75*vx-0.0625*px, sy+0.75*vy-0.0625*py, sx+0.75*vx+0.0625*px, sy+0.75*vy+0.0625*py);
  line(sx+0.75*vx+0.0625*px, sy+0.75*vy+0.0625*py,zx,zy);
  line(sx+0.75*vx-0.0625*px, sy+0.75*vy-0.0625*py,zx,zy);
}
