export const WIDTH = 860;
export const HEIGHT = 380;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const starfield = Array.from({ length: 87 }, (_, i) => ({
  x: (i * 127 + 49) % WIDTH,
  y: (i * 79 + 23) % 282,
  size: i % 9 === 0 ? 2.5 : 1.2,
}));

function star(ctx, x, y, radius, fill) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4 - Math.PI / 2;
    const length = i % 2 ? radius * .34 : radius;
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function city(ctx, base, offset, far) {
  const block = far ? 49 : 65;
  for (let i = 0; i <= WIDTH / block + 2; i += 1) {
    const x = i * block - offset;
    const height = 23 + (i * (far ? 61 : 37) + 14) % (far ? 63 : 78);
    const y = base - height;
    ctx.fillStyle = far ? "#1a2446" : "#131d38";
    ctx.fillRect(x, y, block - 3, height);
    ctx.fillStyle = far ? "#645c9a" : "#4382a7";
    for (let row = 0; row < Math.floor((height - 13) / 12); row += 1) {
      for (let col = 0; col < 3; col += 1) {
        if ((row * 3 + col * 5 + i) % 5 < 2) ctx.fillRect(x + 10 + col * 13, y + 9 + row * 12, 4, 3);
      }
    }
  }
}

function sky(ctx, distance = 0) {
  const fill = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  fill.addColorStop(0, "#0c102e");
  fill.addColorStop(.57, "#1f2150");
  fill.addColorStop(1, "#2f2558");
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const moon = ctx.createRadialGradient(683, 81, 20, 683, 81, 104);
  moon.addColorStop(0, "#8d8bd56b");
  moon.addColorStop(1, "#8278df00");
  ctx.fillStyle = moon;
  ctx.fillRect(575, 0, 216, 189);
  ctx.fillStyle = "#adaaff";
  ctx.beginPath();
  ctx.arc(683, 81, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c5b6fa9e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(683, 82, 52, 10, -.28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#d0e9ffc7";
  for (const point of starfield) ctx.fillRect(point.x, point.y, point.size, point.size);
  city(ctx, 320, (distance * .12) % 49, true);
  city(ctx, 365, (distance * .26) % 65, false);
}

export class StarCatch {
  score = 0;
  lives = 3;
  remaining = 30;
  ended = false;
  player = WIDTH / 2;
  next = .16;
  spawned = 0;
  drops = [];
  motes = [];

  moveTo(x) {
    this.player = clamp(x, 32, WIDTH - 32);
  }

  update(dt, direction) {
    this.moveTo(this.player + direction * 480 * dt);
    this.remaining = Math.max(0, this.remaining - dt);
    this.next -= dt;
    if (this.next <= 0) {
      this.spawned += 1;
      this.drops.push({
        x: 28 + Math.random() * (WIDTH - 56),
        y: -14,
        speed: 106 + Math.random() * 37 + (30 - this.remaining) * 3,
        meteor: this.spawned % 5 === 0,
      });
      this.next = Math.max(.36, .66 - (30 - this.remaining) * .01);
    }

    for (const drop of this.drops) {
      drop.y += drop.speed * dt;
      if (drop.y >= 314 && drop.y < 348 && Math.abs(drop.x - this.player) <= 37) {
        drop.caught = true;
        if (drop.meteor) this.lives -= 1;
        else this.score += 10;
        for (let i = 0; i < 8; i += 1) {
          this.motes.push({ x: drop.x, y: drop.y, dx: Math.cos(i) * 42, dy: Math.sin(i) * 41 - 20, life: .44, meteor: drop.meteor });
        }
      }
    }
    this.drops = this.drops.filter((drop) => !drop.caught && drop.y < HEIGHT + 18);
    for (const mote of this.motes) {
      mote.x += mote.dx * dt;
      mote.y += mote.dy * dt;
      mote.life -= dt;
    }
    this.motes = this.motes.filter((mote) => mote.life > 0);
    this.lives = Math.max(0, this.lives);
    this.ended = this.remaining <= 0 || this.lives === 0;
  }

  draw(ctx) {
    sky(ctx);
    ctx.fillStyle = "#10182deb";
    ctx.fillRect(0, 350, WIDTH, 30);
    ctx.fillStyle = "#4b8da5";
    ctx.fillRect(0, 350, WIDTH, 2);
    const x = this.player;
    ctx.fillStyle = "#69d8fc42";
    ctx.fillRect(x - 40, 345, 80, 3);
    ctx.fillStyle = "#436bb4";
    ctx.fillRect(x - 25, 325, 50, 18);
    ctx.fillStyle = "#8fe7ff";
    ctx.fillRect(x - 32, 320, 64, 6);
    ctx.fillStyle = "#b4edf5";
    ctx.fillRect(x - 20, 341, 40, 4);
    ctx.fillStyle = "#182b52";
    ctx.fillRect(x - 19, 327, 38, 7);

    for (const drop of this.drops) {
      if (drop.meteor) {
        ctx.fillStyle = "#ac8eff";
        ctx.fillRect(drop.x - 5, drop.y - 7, 11, 14);
        ctx.fillRect(drop.x - 8, drop.y - 4, 17, 7);
        ctx.fillStyle = "#d5b1ff";
        ctx.fillRect(drop.x - 4, drop.y - 10, 6, 3);
      } else {
        ctx.save();
        ctx.shadowColor = "#ffd478";
        ctx.shadowBlur = 12;
        star(ctx, drop.x, drop.y, 11, "#ffe3a0");
        ctx.restore();
      }
    }
    for (const mote of this.motes) {
      ctx.globalAlpha = mote.life / .44;
      ctx.fillStyle = mote.meteor ? "#ccb7ff" : "#ffdc87";
      ctx.fillRect(mote.x, mote.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  }
}

const roof = 322;
const catX = 123;
const catWidth = 38;

function drawCat(ctx, x, y, stride) {
  ctx.fillStyle = "#5e558e";
  ctx.fillRect(x + 3, y + 10, 30, 17);
  ctx.fillRect(x - 6, y + 10, 12, 5);
  ctx.fillRect(x - 9, y + 6, 6, 7);
  ctx.fillStyle = "#c6bbff";
  ctx.fillRect(x + 11, y + 6, 27, 17);
  ctx.fillRect(x + 15, y + 1, 7, 8);
  ctx.fillRect(x + 30, y + 1, 6, 8);
  ctx.fillRect(x + 7, y + 21, 27, 5);
  ctx.fillRect(x + 9 + stride, y + 24, 6, 5);
  ctx.fillRect(x + 25 - stride, y + 24, 6, 5);
  ctx.fillStyle = "#fc9ad0";
  ctx.fillRect(x + 18, y + 3, 3, 4);
  ctx.fillRect(x + 31, y + 3, 3, 4);
  ctx.fillStyle = "#24304e";
  ctx.fillRect(x + 23, y + 13, 3, 4);
  ctx.fillRect(x + 32, y + 13, 3, 4);
}

export class RooftopHop {
  score = 0;
  distance = 0;
  position = 0;
  velocity = 0;
  next = 1.12;
  ended = false;
  vents = [];

  jump() {
    if (this.position === 0) this.velocity = -420;
  }

  update(dt) {
    const speed = Math.min(426, 249 + this.distance / 95);
    this.distance += speed * dt;
    this.score = Math.floor(this.distance / 20);
    this.position = Math.min(0, this.position + this.velocity * dt);
    this.velocity = this.position < 0 || this.velocity < 0 ? this.velocity + 1050 * dt : 0;
    this.next -= dt;
    if (this.next <= 0) {
      this.vents.push({ x: WIDTH + 10, width: 27 + Math.round(Math.random() * 10), height: 24 + Math.round(Math.random() * 9) });
      this.next = 1.2 + Math.random() * .56;
    }

    for (const vent of this.vents) {
      vent.x -= speed * dt;
      if (vent.x < catX + catWidth - 4 && vent.x + vent.width > catX + 6 && this.position > -vent.height + 3) {
        this.ended = true;
      }
    }
    this.vents = this.vents.filter((vent) => vent.x + vent.width > 0);
  }

  draw(ctx) {
    sky(ctx, this.distance);
    ctx.fillStyle = "#101b35";
    ctx.fillRect(0, roof, WIDTH, HEIGHT - roof);
    ctx.fillStyle = "#867ac1";
    ctx.fillRect(0, roof, WIDTH, 3);
    ctx.fillStyle = "#2e4467";
    for (let x = 0; x <= WIDTH + 65; x += 64) ctx.fillRect(x - this.distance % 64, roof + 13, 31, 3);
    const stride = this.position < 0 ? 2 : Math.floor(this.distance / 15) % 5;
    drawCat(ctx, catX, roof - 28 + this.position, stride);
    for (const vent of this.vents) {
      const y = roof - vent.height;
      ctx.fillStyle = "#3d4675";
      ctx.fillRect(vent.x, y + 4, vent.width, vent.height - 4);
      ctx.fillStyle = "#8e84cb";
      ctx.fillRect(vent.x - 2, y, vent.width + 4, 5);
      ctx.fillStyle = "#59639a";
      ctx.fillRect(vent.x + 6, y + 12, vent.width - 12, 3);
      ctx.fillRect(vent.x + 6, y + 18, vent.width - 12, 3);
    }
  }
}
