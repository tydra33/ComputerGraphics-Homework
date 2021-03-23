let canvas = document.querySelector("canvas");
canvas.width = 1500;
canvas.height = 700;
let context = canvas.getContext("2d");

function randomInRange(min, max) {
  return Math.random() < 0.5
    ? (1 - Math.random()) * (max - min) + min
    : Math.random() * (max - min) + min;
}

function makePos(num) {
  if (num < 0) {
    num *= -1;
  }
  return num;
}

class Ball {
  constructor(x, y, radius = 8) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;

    // velocity
    this.velX = randomInRange(-0.1, 0.1);
    let randBool = Math.random() < 0.5;
    let rand = -1;
    if (randBool) {
      rand = 1;
    }
    let temp = 0.2 - Math.pow(this.velX, 2);
    this.velY = Math.sqrt(makePos(temp)) * rand;

    this.collided = false;
  }

  draw() {
    let color = "black"
    if (this.collided) {
      color = "cyan";
    }
    context.fillStyle = color;
    context.beginPath();
    context.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
    context.fill();
  }

  move() {
    this.posX += this.velX;
    this.posY += this.velY;

    if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
      this.velX *= -1;
    }

    if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) {
      this.velY *= -1;
    }
  }

  doesTouch(ball) {
    let distanceX = this.posX - ball.posX;
    let distanceY = this.posY - ball.posY;

    return Math.sqrt(distanceX ** 2  + distanceY ** 2) <=  (2 * ball.radius);
  }
}


class QuadTreeNode {
  constructor(centerX, centerY, halfSizeX, halfSizeY) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.halfSizeX = halfSizeX;
    this.halfSizeY = halfSizeY;
  }

  containsBall(ball) {
    return ball.posX >= this.centerX - this.halfSizeX &&
            ball.posX <= this.centerX + this.halfSizeX &&
            ball.posY >= this.centerY - this.halfSizeY &&
            ball.posY <= this.centerY + this.halfSizeY;
  }

  intersectsNode(node) {
    return (
      this.centerX < node.centerX + node.halfSizeX + node.halfSizeY &&
      this.centerX + this.halfSizeX + this.halfSizeY > node.centerX &&
      this.centerY < node.centerX + node.halfSizeX + node.halfSizeY &&
      this.centerY + this.halfSizeX + this.halfSizeY > node.centerY
    );
  }
}


class QuadTree {
  constructor(rectangle){
    this.bound = rectangle;
    this.allBalls = [];

    this.topLeft = null;
    this.topRight = null;
    this.bottomLeft = null;
    this.bottomRight = null;
  }

  divide() {
    this.topLeft = new QuadTree(
      new QuadTreeNode(
        this.bound.centerX,
        this.bound.centerY,
        this.bound.halfSizeX / 2,
        this.bound.halfSizeY / 2
      ),
    );

    this.topRight = new QuadTree(
      new QuadTreeNode(
        this.bound.centerX + this.bound.halfSizeX / 2,
        this.bound.centerY,
        this.bound.halfSizeX / 2,
        this.bound.halfSizeY / 2
      ),
      this.capacity
    );

    this.bottomLeft = new QuadTree(
      new QuadTreeNode(
        this.bound.centerX,
        this.bound.centerY + this.bound.halfSizeY / 2,
        this.bound.halfSizeX / 2,
        this.bound.halfSizeY / 2
      ),
    );

    this.bottomRight = new QuadTree(
      new QuadTreeNode(
        this.bound.centerX + this.bound.halfSizeX / 2,
        this.bound.centerY + this.bound.halfSizeY / 2,
        this.bound.halfSizeX / 2,
        this.bound.halfSizeY / 2
      ),
    );
  }

  insertBall(ball) {
    if(!this.bound.containsBall(ball)) {
      return false;
    }
    else if(this.allBalls.length < 4) {
      this.allBalls.push(ball);
      return true;
    }
    else {
      if(this.topRight == null) {
        this.divide();
      }

      if (this.topLeft.insertBall(ball)) {
        return true;
      }
      else if (this.topRight.insertBall(ball)) {
        return true;
      }
      else if (this.bottomLeft.insertBall(ball)) {
        return true;
      }
      else if (this.bottomRight.insertBall(ball)) {
        return true;
      }
    }
    return false;
  }

  queryRange(range) {
   let ballsInRange = [];
    if(!this.bound.containsBall(range)){
      return ballsInRange;
    }
    for(const ball of this.allBalls){
      if(this.bound.containsBall(ball)){
        ballsInRange.push(ball);
      }
    }

    if(this.topRight == null) {
      return ballsInRange;
    }

    ballsInRange = ballsInRange.concat(this.topLeft.queryRange(range));
    ballsInRange = ballsInRange.concat(this.topRight.queryRange(range));
    ballsInRange = ballsInRange.concat(this.bottomLeft.queryRange(range));
    ballsInRange = ballsInRange.concat(this.bottomRight.queryRange(range));

    return ballsInRange;
  }

  draw() {
    context.strokeStyle = "#3C32A8";
    context.strokeRect(
      this.bound.centerX,
      this.bound.centerY,
      this.bound.halfSizeX,
      this.bound.halfSizeY
    );

    if (this.topRight != null) {
      this.topLeft.draw();
      this.topRight.draw();
      this.bottomLeft.draw();
      this.bottomRight.draw();
    }
  }
}

class Demonstration {
  constructor() {
    this.allBalls = [];

    let bound = new QuadTreeNode(0, 0, canvas.width, canvas.height);
    this.qt = new QuadTree(bound);

    this.addBall = this.addBall.bind(this);

    this.update = this.update.bind(this);
    this.moveAll = this.moveAll.bind(this);
  }

  moveAll() {
    for (const ball of this.allBalls) {
      ball.move();
    }
  }
  
  addBalls(num) {
    for (let i = 0; i < num; i++) {
      let b = new Ball(
        randomInRange(8.0, canvas.width - 8.0),
        randomInRange(8.0, canvas.height - 8.0)
      );
      this.allBalls.push(b);
    }
  }
  
  addBall(ball) {
    this.allBalls.push(ball);
  }

  checkCollision(ball, quad) {
    let range = new Ball(ball.posX, ball.posY, 5 + ball.radius);
    let possible = quad.queryRange(range);

    for(const zoga of possible) {
      if(zoga !== ball && ball.doesTouch(zoga)) {
        zoga.collided = true;
        ball.collided = true;
      }
    }
  }

  update() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let bound = new QuadTreeNode(0, 0, canvas.width, canvas.height);
    this.qt = new QuadTree(bound, this.capacity);

    // insert to quad tree
    for (const zoga of this.allBalls) {
      this.qt.insertBall(zoga);
    }

    // collision detection and drawing
    for (const zoga of this.allBalls) {
      this.checkCollision(zoga, this.qt);
      zoga.draw();
      zoga.collided = false;
    }

    // move all balls and draw tree
    this.moveAll();
    this.qt.draw();
    requestAnimationFrame(this.update);
  }
}

let numBalls = document.getElementById("numBalls");
numBalls.value = 50;
let btn = document.getElementById("btn");

const demo = new Demonstration();
demo.addBalls(numBalls.value);

btn.addEventListener("click",() => {
  let num = numBalls.value;

  demo.allBalls = [];
  demo.addBalls(num);
});

canvas.addEventListener("click",(e) => {
  let ball = new Ball(e.clientX, e.clientY)
  demo.addBall(ball);
  numBalls.value++;
});

requestAnimationFrame(demo.update);
