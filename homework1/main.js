class Vector4f {
  constructor(x, y, z, w = 1) {
    this.X = x;
    this.Y = y;
    this.Z = z;
    this.W = w;
    if (x == undefined || y == undefined || z == undefined) {
      console.error("The length of the vector is 0.");
    }
  }

  static negate(input1) {
    return new Vector4f(input1.X * -1, input1.Y * -1, input1.Z * -1);
  }

  static add(input1, input2) {
    return new Vector4f(
      input1.X + input2.X,
      input1.Y + input2.Y,
      input1.Z + input2.Z
    );
  }

  static scalarProduct(input1, input2) {
    return new Vector4f(
      input1 * input2.X,
      input1 * input2.Y,
      input1 * input2.Z
    );
  }

  static dotProduct(input1, input2) {
    return input1.X * input2.X + input1.Y * input2.Y + input1.Z * input2.Z;
  }

  static crossProduct(input1, input2) {
    return new Vector4f(
      input1.Y * input2.Z - input1.Z * input2.Y,
      input1.Z * input2.X - input1.X * input2.Z,
      input1.X * input2.Y - input1.Y * input2.X
    );
  }

  static length(input1) {
    return Math.sqrt(input1.X ** 2 + input1.Y ** 2 + input1.Z ** 2);
  }

  static normalize(input1) {
    let len = Vector4f.length(input1);
    return new Vector4f(input1.X / len, input1.Y / len, input1.Z / len);
  }

  static project(input1, input2) {
    let scalarPart =
      Vector4f.dotProduct(input1, input2) / Vector4f.length(input2) ** 2;
    return Vector4f.scalarProduct(scalarPart, input2);
  }

  static cosPhi(input1, input2) {
    return Vector4f.dotProduct(
      Vector4f.normalize(input1),
      Vector4f.normalize(input2)
    );
  }

  toString() {
    return "v " + this.X + " " + this.Y + " " + this.Z;
  }
}

class Matrix4f {
  constructor(line1, line2, line3, line4) {
    this.row1 = line1;
    this.row2 = line2;
    this.row3 = line3;
    this.row4 = line4;
  }

  static negate(matrix) {
    let newLines = [];
    let lines = [matrix.row1, matrix.row2, matrix.row3, matrix.row4];

    for (let i = 0; i < 4; i++) {
      let currLine = [];
      for (let j = 0; j < 4; j++) {
        currLine.push(lines[i][j] * -1);
      }
      newLines.push(currLine);
    }
    return new Matrix4f(newLines[0], newLines[1], newLines[2], newLines[3]);
  }

  static add(matrix1, matrix2) {
    let newLines = [];
    let lines1 = [matrix1.row1, matrix1.row2, matrix1.row3, matrix1.row4];
    let lines2 = [matrix2.row1, matrix2.row2, matrix2.row3, matrix2.row4];

    for (let i = 0; i < 4; i++) {
      let currLine = [];
      for (let j = 0; j < 4; j++) {
        currLine.push(lines1[i][j] + lines2[i][j]);
      }
      newLines.push(currLine);
    }
    return new Matrix4f(newLines[0], newLines[1], newLines[2], newLines[3]);
  }

  static transpose(matrix) {
    let newLines = [];

    for (let i = 0; i < 4; i++) {
      newLines.push([
        matrix.row1[i],
        matrix.row2[i],
        matrix.row3[i],
        matrix.row4[i],
      ]);
    }
    return new Matrix4f(newLines[0], newLines[1], newLines[2], newLines[3]);
  }

  static multiplyScalar(num, matrix) {
    let newLines = [];
    let lines = [matrix.row1, matrix.row2, matrix.row3, matrix.row4];

    for (let i = 0; i < 4; i++) {
      let currLine = [];
      for (let j = 0; j < 4; j++) {
        currLine.push(lines[i][j] * num);
      }
      newLines.push(currLine);
    }
    return new Matrix4f(newLines[0], newLines[1], newLines[2], newLines[3]);
  }

  static multiply(matrix1, matrix2) {
    let lines1 = [matrix1.row1, matrix1.row2, matrix1.row3, matrix1.row4];
    let lines2 = [
      Matrix4f.transpose(matrix2).row1,
      Matrix4f.transpose(matrix2).row2,
      Matrix4f.transpose(matrix2).row3,
      Matrix4f.transpose(matrix2).row4,
    ];
    let newLines = [];
    let currLine = [];

    for (let line1 of lines1) {
      let sum = 0;
      for (let line2 of lines2) {
        for (let i = 0; i < 4; i++) {
          sum += line1[i] * line2[i];
        }
        currLine.push(sum);
        sum = 0;
      }
      newLines.push(currLine);
      currLine = [];
    }

    return new Matrix4f(newLines[0], newLines[1], newLines[2], newLines[3]);
  }

  toString() {
    let str = "";
    for (const el of this.row1) {
      str += " " + el;
    }
    str += "\n";
    for (const el of this.row2) {
      str += " " + el;
    }
    str += "\n";
    for (const el of this.row3) {
      str += " " + el;
    }
    str += "\n";
    for (const el of this.row4) {
      str += " " + el;
    }
    return str;
  }
}

class pointManager {
  static read() {
    let vectors = [];
    const input = document.getElementById("input").value;
    for (let vector of input.split(/\n/g)) {
      let temp = vector.split(" ");
      vectors.push(
        new Vector4f(Number(temp[1]), Number(temp[2]), Number(temp[3]))
      );
    }
    return vectors;
  }

  static printData(data) {
    let str = "";
    for (const vector of data) {
      str += vector + "\n";
    }
    document.getElementById("transformationOutput").value = str;
  }
}

class Transformation {
  constructor() {
    this.mainMatrix = new Matrix4f(
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    );
  }

  translate(vector) {
    this.mainMatrix = Matrix4f.multiply(
      new Matrix4f(
        [1, 0, 0, vector.X],
        [0, 1, 0, vector.Y],
        [0, 0, 1, vector.Z],
        [0, 0, 0, 1]
      ),
      this.mainMatrix
    );
  }

  scale(vector) {
    this.mainMatrix = Matrix4f.multiply(
      new Matrix4f(
        [vector.X, 0, 0, 0],
        [0, vector.Y, 0, 0],
        [0, 0, vector.Z, 0],
        [0, 0, 0, 1]
      ),
      this.mainMatrix
    );
  }

  rotateX(angle) {
    this.mainMatrix = Matrix4f.multiply(
      new Matrix4f(
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0, Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
      ),
      this.mainMatrix
    );
  }

  rotateY(angle) {
    this.mainMatrix = Matrix4f.multiply(
      new Matrix4f(
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
      ),
      this.mainMatrix
    );
  }

  rotateZ(angle) {
    this.mainMatrix = Matrix4f.multiply(
      new Matrix4f(
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
      ),
      this.mainMatrix
    );
  }

  static transformPoint(vector, mainMatrix) {
    let currLine = [];
    let lines = [
      mainMatrix.row1,
      mainMatrix.row2,
      mainMatrix.row3,
      mainMatrix.row4,
    ];

    for (let line of lines) {
      let sum =
        line[0] * vector.X +
        line[1] * vector.Y +
        line[2] * vector.Z +
        line[3] * vector.W;
      currLine.push(sum);
    }

    return new Vector4f(
      currLine[0].toFixed(3),
      currLine[1].toFixed(3),
      currLine[2].toFixed(3),
      currLine[3].toFixed(3)
    );
  }
}

class TransformPoints {
  static transform() {
    let pM = pointManager.read();
    let t = new Transformation();

    t.translate(new Vector4f(1.25, 0, 0));
    t.rotateZ(Math.PI / 3);
    t.translate(new Vector4f(0, 0, 4.15));
    t.translate(new Vector4f(0, 3.14, 0));
    t.scale(new Vector4f(1.12, 1.12, 1));
    t.rotateY((5 * Math.PI) / 8);

    let points = [];
    for (const point of pM) {
      points.push(Transformation.transformPoint(point, t.mainMatrix));
    }

    pointManager.printData(points);
  }
}

const toka = document.getElementById("tokaTransformim");
toka.addEventListener("click", TransformPoints.transform);
