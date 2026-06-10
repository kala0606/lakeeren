// Sine class for p5.js
class Sine {
  constructor() {
    this.size = Math.floor(random(5 * M, 100 * M));
    this.index = Math.floor(random(1000 * M));
    this.avxSine = 0;
    this.colf = color(255);
    this.colb = color(255);
  }

  update() {
    this.avxSine = avx;
    this.colf = clr1A[Math.floor(this.index + frameCount / 2) % clr1Num] || color(255);
    this.colb = clr1B[Math.floor(this.index + frameCount / 2) % clr1Num] || color(255);
  }

  display(pg = window) {
    if (sineCh == 0) {
      pg.push();
      for (let y = -height; y < height; y += height / 10) {
        for (let x = -width; x < width; x += width / 10) {
          // Use different colors for anaglyph mode
          let fillColor, strokeColor;
          if (typeof anaglyphMode !== 'undefined' && anaglyphMode) {
            if (str) {
              fillColor = pg.color(0, 0, 0); // Pure black shapes when strobing in 3D
              strokeColor = pg.color(255, 255, 255); // White stroke for black shapes
            } else {
              fillColor = pg.color(255, 255, 255); // Pure white shapes in 3D
              strokeColor = pg.color(0, 0, 0); // Black stroke for white shapes
            }
            pg.strokeWeight(0.3);
          } else {
            // Use individual colors for each sine element in normal mode
            let colorIndex = Math.floor((x + y + frameCount) / 8) % clr1Num;
            fillColor = clr1A[colorIndex] || pg.color(255);
            strokeColor = pg.color(0);
            pg.strokeWeight(0.5);
          }
          
          pg.fill(fillColor);
          pg.stroke(strokeColor);
          pg.push();
          pg.translate(
            x,
            y + sin(x + this.avxSine / 10) * height * M,
            -1000 + noise(x / 10, y / 10) * 1000 + sin(this.avxSine / 10) * 1000
          );
          pg.rotateX(radians(noise(x, y) * 360) + this.avxSine);
          pg.rotateY(radians(noise(x, y) * 360) + this.avxSine);
          pg.rotateZ(radians(noise(x, y) * 360) + this.avxSine);
          pg.box(this.size * noise(x / 100, y / 100) * ds);
          pg.pop();
        }
      }
      pg.pop();
    }

    if (sineCh == 1) {
      pg.push();
      for (let y = -height; y < height; y += this.size / 10) {
        let x = 0;
        // Use different colors for anaglyph mode
        let fillColor, strokeColor;
        if (typeof anaglyphMode !== 'undefined' && anaglyphMode) {
          if (str) {
            fillColor = pg.color(0, 0, 0); // Pure black shapes when strobing in 3D
            strokeColor = pg.color(255, 255, 255); // White stroke for black shapes
          } else {
            fillColor = pg.color(255, 255, 255); // Pure white shapes in 3D
            strokeColor = pg.color(0, 0, 0); // Black stroke for white shapes
          }
          pg.strokeWeight(0.3);
        } else {
          // Use individual colors for each sine element in normal mode
          let colorIndex = Math.floor((y + frameCount) / 12) % clr1Num;
          fillColor = clr1A[colorIndex] || pg.color(255);
          strokeColor = pg.color(0);
          pg.strokeWeight(0.5);
        }
        
        pg.fill(fillColor);
        pg.stroke(strokeColor);
        pg.push();
        pg.translate(
          x + sin(y / 100 + this.avxSine / 10) * width / 2 * M,
          y,
          -1000 + noise(x / 10, y / 10) * 1000 + sin(this.avxSine / 10) * 1000
        );
        pg.rotateZ(radians(noise(x, y) * 360) + this.avxSine);
        pg.box(sin(y / 100 + this.avxSine / 10) * this.size * M * ds);
        pg.noStroke();
        pg.pop();
      }
      pg.pop();
    }

    if (sineCh == 2) {
      pg.push();
      for (let x = -width; x < width; x += this.size / 10) {
        let y = height * sin(x / 300 + this.avxSine / 10);
        // Use different colors for anaglyph mode
        let fillColor, strokeColor;
        if (typeof anaglyphMode !== 'undefined' && anaglyphMode) {
          if (str) {
            fillColor = pg.color(0, 0, 0); // Pure black shapes when strobing in 3D
            strokeColor = pg.color(255, 255, 255); // White stroke for black shapes
          } else {
            fillColor = pg.color(255, 255, 255); // Pure white shapes in 3D
            strokeColor = pg.color(0, 0, 0); // Black stroke for white shapes
          }
          pg.strokeWeight(0.3);
        } else {
          // Use individual colors for each sine element in normal mode
          let colorIndex = Math.floor((x + frameCount) / 16) % clr1Num;
          fillColor = clr1A[colorIndex] || pg.color(255);
          strokeColor = pg.color(0);
          pg.strokeWeight(0.5);
        }
        
        pg.fill(fillColor);
        pg.stroke(strokeColor);
        pg.push();
        pg.translate(
          x,
          y,
          -1000 + noise(x / 300, y / 300) * 1000 + sin(this.avxSine / 10) * 1000
        );
        pg.rotateX(radians(noise(x / 300, y / 300) * 360) + this.avxSine / 20);
        pg.rotateY(radians(noise(x / 300, y / 300) * 360) + this.avxSine / 10);
        pg.rotateZ(radians(noise(x / 300, y / 300) * 360) + this.avxSine / 20);
        pg.box(this.size * noise(x / 100, y / 100) * ds);
        pg.pop();
      }
      pg.pop();
    }
  }
} 