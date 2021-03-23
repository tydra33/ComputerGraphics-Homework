let canvas = document.querySelector("canvas");
canvas.width = 1200;
canvas.height = 500;
let context = canvas.getContext("2d");
let changeColorBtn = document.getElementById("changeColorBtn");
let changeIndexField = document.getElementById("curveIndex");
let changeColor = document.getElementById("colorPicker");
let drawBox = document.getElementById("draw");
let selectBox = document.getElementById("select");
let clearCurvesBtn = document.getElementById("clearCurvesBtn");
let newCurveBtn = document.getElementById("newCurveBtn");

class Demonstration {
  constructor() {
    this.listNodes = [];
    this.listCurve = [];
    this.selected = [];
    // for movement
    this.moveNode = null;
    this.moveList = [];
    // for new curve
    this.newBezier = true;
  }

  addNode(n) {
    this.listNodes.push(n);
  }

  addCurve(c) {
    this.listCurve.push(c);
  }

  drawAllCurves() {
    for (const crv of this.listCurve) {
      crv.draw(crv.color);
      crv.n1.draw();
      crv.n2.draw();
      crv.n3.draw();
      crv.n4.draw();
      Demonstration.drawLine(crv.n1, crv.n2, true);
      Demonstration.drawLine(crv.n4, crv.n3, true);
    }
  }

  static drawLine(n1, n2, isDashed = false, color = "blue") {
    context.lineWidth = 3.0;
    if (isDashed) {
      context.strokeStyle = "#2F4F4F";
      context.setLineDash([2, 3]);
    } else {
      context.strokeStyle = color;
      context.setLineDash([]);
    }
    context.beginPath();
    context.moveTo(n1.x, n1.y);
    context.lineTo(n2.x, n2.y);
    context.stroke();
  }
}

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static getDistance(n1, n2) {
    return Math.sqrt((n2.x - n1.x) ** 2 - (n2.y - n1.y) ** 2);
  }

  toString() {
    console.log(this.x + ", " + this.y);
  }
}

class ApproximatedNode extends Node {
  draw(color = "red") {
    context.fillStyle = color;
    context.beginPath();
    context.arc(this.x, this.y, 4, 0, 2 * Math.PI);
    context.fill();
  }
}

class InterpolatedNode extends Node {
  draw(color = "red") {
    context.fillStyle = color;
    context.beginPath();
    context.rect(this.x, this.y, 8, 8);
    context.fill();
  }

  static getApproximated(reflectedPoint, centerOfReflection) {
    return new ApproximatedNode(
      2 * reflectedPoint.x - centerOfReflection.x,
      2 * reflectedPoint.y - centerOfReflection.y
    );
  }
}

class Curve {
  constructor(n1, n2, n3, n4, color = "blue") {
    this.n1 = n1;
    this.n2 = n2;
    this.n3 = n3;
    this.n4 = n4;
    this.pts = [];
    this.color = color;
    this.isSelected = false;
  }

  // calculate
  kalkulo() {
    this.pts = [];
    for (let t = 0; t < 1; t += 0.01) {
      let Qx =
        (1 - t) ** 3 * this.n1.x +
        3 * (1 - t) ** 2 * t * this.n2.x +
        3 * (1 - t) * t ** 2 * this.n3.x +
        t ** 3 * this.n4.x;
      let Qy =
        (1 - t) ** 3 * this.n1.y +
        3 * (1 - t) ** 2 * t * this.n2.y +
        3 * (1 - t) * t ** 2 * this.n3.y +
        t ** 3 * this.n4.y;
      this.pts.push(new Node(Qx, Qy));
    }
  }

  draw(color = "blue") {
    if (this.isSelected) {
      color = "orange";
    }
    let prev = this.n1;
    for (const pt of this.pts) {
      Demonstration.drawLine(prev, pt, false, color);
      prev = pt;
    }
    Demonstration.drawLine(prev, this.n4);
  }

  toString() {
    console.log(this.n1 + ";" + this.n2 + ";" + this.n3 + ";" + this.n4 + ";");
  }
}

// general drawing function
const vizato = (e) => {
  let x = e.offsetX;
  let y = e.offsetY;
  let n;
  //demo.listCurve.length == 0
  if (demo.newBezier) {
    if (demo.listNodes.length == 0 || demo.listNodes.length == 3) {
      n = new InterpolatedNode(x, y);
      n.draw();
      demo.addNode(n);
      if (demo.listNodes.length == 4) {
        Demonstration.drawLine(demo.listNodes[2], demo.listNodes[3], true);
        demo.newBezier = false;
      }
    } else {
      n = new ApproximatedNode(x, y);
      n.draw();
      demo.addNode(n);
      if (demo.listNodes.length == 2) {
        Demonstration.drawLine(demo.listNodes[0], demo.listNodes[1], true);
      }
    }
  } else {
    if (demo.listNodes.length == 0) {
      let c = demo.listCurve[demo.listCurve.length - 1];
      demo.addNode(c.n4);
      let m = InterpolatedNode.getApproximated(c.n4, c.n3);
      m.draw();
      demo.addNode(m);
      Demonstration.drawLine(demo.listNodes[0], demo.listNodes[1], true);
      n = new InterpolatedNode(x, y);
      n.draw();
      demo.addNode(n);
    } else {
      n = new ApproximatedNode(x, y);
      n.draw();
      demo.addNode(n);
      Demonstration.drawLine(demo.listNodes[2], demo.listNodes[3], true);
    }
  }

  if (demo.listNodes.length == 4) {
    let c;
    if (demo.listCurve.length == 0) {
      c = new Curve(
        demo.listNodes[0],
        demo.listNodes[1],
        demo.listNodes[2],
        demo.listNodes[3]
      );
      demo.listNodes = [];
    } else {
      c = new Curve(
        demo.listNodes[0],
        demo.listNodes[1],
        demo.listNodes[3],
        demo.listNodes[2]
      );
      demo.listNodes = [];
    }
    demo.addCurve(c);
    c.kalkulo();
    c.draw();
  }
};

//function for coloring curves
const ngjyros = (e) => {
  for (el of demo.selected) {
    el.color = changeColor.value;
    el.isSelected = false;
  }
  demo.selected = [];

  context.clearRect(0, 0, canvas.width, canvas.height);
  demo.drawAllCurves();
};

// select a curve
const selekto = (e) => {
  let x = e.offsetX;
  let y = e.offsetY;
  for (const crv of demo.listCurve) {
    for (pt of crv.pts) {
      if (Math.abs(x - pt.x) <= 3 && Math.abs(y - pt.y) <= 3) {
        crv.isSelected = true;
        demo.selected.push(crv);
        break;
      }
    }
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  demo.drawAllCurves();
};

//function for clearing selected curves
const fshi = (e) => {
  for (el of demo.selected) {
    demo.listCurve.splice(demo.listCurve.indexOf(el), 1);
  }
  demo.selected = [];

  context.clearRect(0, 0, canvas.width, canvas.height);
  demo.drawAllCurves();
};

// function for selecting points
const selektoPike = (e) => {
  let x = e.offsetX;
  let y = e.offsetY;
  for (const crv of demo.listCurve) {
    if (Math.abs(x - crv.n1.x) <= 10 && Math.abs(y - crv.n1.y) <= 10) {
      demo.moveNode = crv.n1;
      demo.moveList.push(crv);
      crv.n1.draw("green");
    } else if (Math.abs(x - crv.n2.x) <= 4 && Math.abs(y - crv.n2.y) <= 4) {
      demo.moveNode = crv.n2;
      demo.moveList.push(crv);
      crv.n2.draw("green");
    } else if (Math.abs(x - crv.n3.x) <= 4 && Math.abs(y - crv.n3.y) <= 4) {
      demo.moveNode = crv.n3;
      demo.moveList.push(crv);
      crv.n3.draw("green");
    } else if (Math.abs(x - crv.n4.x) <= 10 && Math.abs(y - crv.n4.y) <= 10) {
      demo.moveNode = crv.n4;
      demo.moveList.push(crv);
      crv.n4.draw("green");
    }
  }
};

// unselect point
const mosSelekto = (e) => {
  if (demo.moveNode != null) {
    demo.moveNode.draw();
    demo.moveNode = null;
    demo.moveList = [];
  }
};

// move point
const leviz = (e) => {
  if (demo.moveNode != null) {
    let x = e.clientX;
    let y = e.clientY;
    demo.moveNode.x = x;
    demo.moveNode.y = y;

    for (const el of demo.moveList) {
      el.kalkulo();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    demo.drawAllCurves();
  }
};

const newBezier = (e) => {
  demo.newBezier = true;
};

function mode(obj) {
  var checks = document.getElementsByClassName("check");
  for (var i = 0; i < checks.length; i++) {
    checks[i].checked = false;
  }
  obj.checked = true;
  if (obj == document.getElementById("select")) {
    canvas.removeEventListener("mousedown", vizato);
    canvas.removeEventListener("mousedown", selektoPike);
    canvas.removeEventListener("mouseup", mosSelekto);
    canvas.removeEventListener("mousemove", leviz);
    newCurveBtn.removeEventListener("click", newBezier);
    changeColorBtn.addEventListener("click", ngjyros);
    canvas.addEventListener("mousedown", selekto);
    clearCurvesBtn.addEventListener("click", fshi);
  } else if (obj == document.getElementById("draw")) {
    for (el of demo.selected) {
      el.isSelected = false;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    demo.drawAllCurves();
    demo.selected = [];
    newCurveBtn.addEventListener("click", newBezier);
    changeColorBtn.removeEventListener("click", ngjyros);
    clearCurvesBtn.removeEventListener("click", fshi);
    canvas.removeEventListener("mousedown", selekto);
    canvas.removeEventListener("mousedown", selektoPike);
    canvas.removeEventListener("mouseup", mosSelekto);
    canvas.removeEventListener("mousemove", leviz);
    canvas.addEventListener("mousedown", vizato);
  } else {
    for (el of demo.selected) {
      el.isSelected = false;
    }
    demo.selected = [];
    canvas.removeEventListener("mousedown", selekto);
    canvas.removeEventListener("mousedown", vizato);
    changeColorBtn.removeEventListener("click", ngjyros);
    clearCurvesBtn.removeEventListener("click", fshi);
    newCurveBtn.removeEventListener("click", newBezier);
    canvas.addEventListener("mousedown", selektoPike);
    canvas.addEventListener("mouseup", mosSelekto);
    canvas.addEventListener("mousemove", leviz);
  }
}

let demo = new Demonstration();
mode(drawBox);
