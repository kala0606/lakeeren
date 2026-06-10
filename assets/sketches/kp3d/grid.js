// Grid class for p5.js
class Grid {
  constructor() {
    this.size = Math.floor(random(50 * M, 1000 * M));
    this.index = Math.floor(random((width / this.size) * M));
    this.avxGrid = 0;
    this.colf = color(0);
    this.colb = color(0);
  }

  update() {
    if (filteredSignal[3] > 10) {
      let floatChoices = [50.0, 100.0, 300.0];
      // this.size = Math.floor(getRandomChoice(floatChoices));
    }
    this.colf = clr1A[Math.floor(this.index + frameCount / 2) % clr1Num] || color(255);
    this.colb = clr1B[Math.floor(this.index + frameCount / 2) % clr1Num] || color(255);
    this.avxGrid = avx;
  }

  display(pg = window) {
    if (gridCh == 0) {
      pg.push();
      for (let x = -width; x < width; x += this.size) {
        for (let y = -height / 2; y < height / 2; y += this.size) {
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
            // Use individual colors for each grid element in normal mode
            let colorIndex = Math.floor((x + y + frameCount) / 10) % clr1Num;
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
            -2000 + noise(x / 10, y / 10) * 1000 + sin(this.avxGrid / 10) * 3000
          );
          pg.rotateY(radians(noise(x, y) * 360) + this.avxGrid);
          pg.rect(0, 0, this.size * noise(x / 100, y / 100) * ds, this.size * 2 * noise(x / 100, y / 100) * ds);
          pg.pop();
        }
      }
      pg.pop();
    }

    if (gridCh == 1) {
      pg.push();
      for (let x = -width; x < width; x += this.size) {
        for (let y = -height / 2; y < height / 2; y += this.size) {
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
            // Use individual colors for each grid element in normal mode
            let colorIndex = Math.floor((x + y + frameCount) / 15) % clr1Num;
            fillColor = clr1A[colorIndex] || pg.color(255);
            strokeColor = pg.color(0);
            pg.strokeWeight(0.5);
          }
          
          pg.fill(fillColor);
          pg.stroke(strokeColor);
          pg.push();
          pg.translate(
            x,
            y + noise(x / 10, y / 10) * 1000,
            -1000 + noise(x / 10, y / 10) * 1000 + sin(this.avxGrid / 10) * 1000
          );
          pg.rotateY(radians(noise(x, y) * 360) + this.avxGrid);
          pg.rect(0, 0, this.size * noise(x / 100, y / 100) * ds, this.size * 2 * noise(x / 100, y / 100) * ds);
          pg.pop();
        }
      }
      pg.pop();
    }

    if (gridCh == 2) {
      pg.push();
      for (let x = -width; x < width; x += this.size) {
        for (let y = -height / 2; y < height / 2; y += this.size) {
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
            // Use individual colors for each grid element in normal mode
            let colorIndex = Math.floor((x + y + frameCount) / 20) % clr1Num;
            fillColor = clr1A[colorIndex] || pg.color(255);
            strokeColor = pg.color(0);
            pg.strokeWeight(0.5);
          }
          
          pg.fill(fillColor);
          pg.stroke(strokeColor);
          pg.push();
          pg.translate(
            x + noise(x / 10, y / 10) * 1000 - sin(this.avxGrid / 10) * 100,
            y,
            -1000 + noise(x / 10, y / 10) * 1000 + sin(this.avxGrid / 10) * 1000
          );
          pg.rotateY(radians(noise(x, y) * 360) + this.avxGrid);
          pg.rect(0, 0, this.size * noise(x / 100, y / 100) * ds, this.size * 2 * noise(x / 100, y / 100) * ds);
          pg.pop();
        }
      }
      pg.pop();
    }
  }
} 