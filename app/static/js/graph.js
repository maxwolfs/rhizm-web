let edgeColor = "#777777";
let nodeColor = "#777777";
let textColor = "#212121";
let backgroundColor = "#FAFAFA";

let nodes = [];
let pairedIDs = [];

let font;

function preload() {
  font = loadFont("static/fonts/font.ttf");
}

function setup() {
  //createCanvas(windowWidth, windowHeight);
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("sketch-holder");
  getIntercoursesFromServerInitial();
  textFont(font);

  setInterval(function() {
    getIntercoursesFromServer();
  }, 3000);
}

function draw() {
  background(backgroundColor);
  Pos.calculateMidpoint();

  // noStroke();
  // fill(textColor);
  // text("FPS: " + round(frameRate()), 20, 20);

  showNodes();
  computeNodes();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function computeNodes() {
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].calculateForcePref();
  }
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].applyForce();
  }
}

function showNodes() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      nodes[i].showEdge(nodes[j]);
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].showVertex();
  }
}

function getIntercoursesFromServerInitial() {
  loadJSON('/api/v1/graph?starting_point=0', initialNodeSetup);
  //loadJSON("static/js/test.json", initialNodeSetup);
}

function getIntercoursesFromServer() {
  loadJSON('/api/v1/graph?starting_point=0', jsonToIntercourses);
  //loadJSON("static/js/test.json", jsonToIntercourses);
}

function initialNodeSetup(json) {
  jsonToIntercourses(json);
  precomputeNodePositions();
}

function jsonToIntercourses(json) {
  for (let i = 0; i < json.data.length; i++) {
    if (json.data[i].verified == true && !pairedIDs.includes(json.data[i].id)) {
      addIntercourse(json.data[i].first, json.data[i].second);
      pairedIDs.push(json.data[i].id);
    }
  }
}

function precomputeNodePositions() {
  for (let i = 0; i < 100; i++) {
    computeNodes();
  }
}

function addIntercourse(idA, idB) {
  let a = getOrCreateNode(idA);
  let b = getOrCreateNode(idB);
  a.intercourses.push(b);
  b.intercourses.push(a);
}

function getOrCreateNode(id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id == id) {
      return nodes[i];
    }
  }
  let newNode = new Node(id);
  nodes.push(newNode);
  return newNode;
}

class Node {
  constructor(id) {
    this.id = id;
    this.position = createVector(random(1), random(1));
    this.smoothPosition = createVector(this.position.x, this.position.y);
    this.intercourses = [];
    this.summedForce = createVector(0, 0);
    Node.minimumSize = 0.1;

    Node.cMin = 0.7;
    Node.cMax = 0.3;
    Node.bMin = 0.75;
    Node.bPref = 3.5;

    Node.gravity = 0.0001;
    Node.centerGravity = 0.996;
  }

  showVertex() {
    noStroke();
    fill(nodeColor);
    let scale = this.intercourses.length / nodes.length;
    ellipse(
      Pos.x(this.smoothPosition.x),
      Pos.y(this.smoothPosition.y),
      Pos.s(Node.minimumSize * scale),
      Pos.s(Node.minimumSize * scale)
    );

    noStroke();
    fill(textColor);
    noStroke();
    let sign = 1;
    if (Pos.x(this.smoothPosition.x) < windowWidth / 2) {
      textAlign(RIGHT, CENTER);
      sign = -1;
    } else {
      textAlign(LEFT, CENTER);
    }
    text(
      this.id.substring(0, 8),
      Pos.x(this.smoothPosition.x) +
        Pos.s(Node.minimumSize * scale / 2) * sign +
        10 * sign,
      Pos.y(this.smoothPosition.y)
    );
  }

  showEdge(otherNode) {
    stroke(edgeColor);
    if (this.intercourses.includes(otherNode)) {
      line(
        Pos.x(this.smoothPosition.x),
        Pos.y(this.smoothPosition.y),
        Pos.x(otherNode.smoothPosition.x),
        Pos.y(otherNode.smoothPosition.y)
      );
    }
  }

  calculateForceFR() {
    let k = 1 / nodes.length;
    let force = createVector(0, 0);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] != this) {
        let distance = p5.Vector.dist(this.position, nodes[i].position);

        if (this.intercourses.includes(nodes[i])) {
          let intercourseCount = getCountOfObjectInList(
            nodes[i],
            this.intercourses
          );
          let strength = sq(distance) / k * intercourseCount;
          strength -= sq(k) / distance * this.intercourses.length; // <--- HACK!
          force = p5.Vector.sub(nodes[i].position, this.smoothFactor).mult(
            strength
          );
        } else {
          let strength = sq(k) / distance;
          force = p5.Vector.sub(this.position, nodes[i].position).mult(
            strength
          );
        }
        this.summedForce.add(force);
      }
    }
  }

  calculateForcePref() {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] != this) {
        let distance = p5.Vector.dist(this.position, nodes[i].position);

        let thisR = this.intercourses.length * Node.minimumSize / nodes.length;
        let thatR =
          nodes[i].intercourses.length * Node.minimumSize / nodes.length;

        let dMin =
          thisR +
          thatR +
          Node.bMin *
            (Node.cMin * min(thisR, thatR) + Node.cMax * max(thisR, thatR));
        let dPref =
          thisR +
          thatR +
          Node.bPref *
            (Node.cMin * min(thisR, thatR) + Node.cMax * max(thisR, thatR));

        if (this.intercourses.includes(nodes[i])) {
          let attract = sq(max(distance - dMin, 0)) / (dPref - dMin);
          let attractionForce = p5.Vector.sub(
            nodes[i].position,
            this.position
          ).mult(attract);
          this.summedForce.add(attractionForce);
          nodes[i].summedForce.add(attractionForce.mult(-1));
        }

        let repulse = sq(dPref - dMin) / max(distance - dMin, 0.001);
        let repulsionForce = p5.Vector.sub(
          this.position,
          nodes[i].position
        ).mult(repulse);
        this.summedForce.add(repulsionForce);

        let gravitation = p5.Vector.sub(this.position, nodes[i].position)
          .normalize()
          .mult(Node.gravity * this.intercourses.length);
        nodes[i].summedForce.add(gravitation);
      }
    }

    let smoothFactor = 0.99;
    this.smoothPosition.mult(smoothFactor);
    this.smoothPosition.add(
      createVector(
        this.position.x * (1 - smoothFactor),
        this.position.y * (1 - smoothFactor)
      )
    );
  }

  applyForce() {
    this.summedForce.mult(1 / nodes.length);
    if (this.summedForce.mag() > 0.2) {
      this.summedForce.normalize().mult(0.2);
    }
    this.position.add(this.summedForce);
    this.position.mult(Node.centerGravity);
  }
}

class Pos {
  static calculateMidpoint() {
    let minX = Number.MAX_VALUE,
      maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE,
      maxY = Number.MIN_VALUE;

    for (let i = 0; i < nodes.length; i++) {
      minX = min(nodes[i].smoothPosition.x, minX);
      maxX = max(nodes[i].smoothPosition.x, maxX);
      minY = min(nodes[i].smoothPosition.y, minY);
      maxY = max(nodes[i].smoothPosition.y, maxY);
    }

    let x = (maxX - minX) / 2 + minX;
    let y = (maxY - minY) / 2 + minY;
    Pos.midPoint = createVector(x, y);
  }

  static x(relative) {
    return (
      max(windowWidth - windowHeight, 0) / 2 +
      (relative - Pos.midPoint.x + 0.5) * min(windowWidth, windowHeight)
    );
  }

  static y(relative) {
    return (
      max(windowHeight - windowWidth, 0) / 2 +
      (relative - Pos.midPoint.y + 0.5) * min(windowWidth, windowHeight)
    );
  }

  static s(relative) {
    return relative * min(windowWidth, windowHeight);
  }
}

function getCountOfObjectInList(obj, list) {
  let count = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] == obj) {
      count++;
    }
  }
  return count;
}

// addEventListener("click", function() {
//   var el = document.documentElement,
//     rfs =
//       el.requestFullscreen ||
//       el.webkitRequestFullScreen ||
//       el.mozRequestFullScreen ||
//       el.msRequestFullscreen;
//   rfs.call(el);
// });
