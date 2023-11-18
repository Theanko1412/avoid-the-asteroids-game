var mySpaceShip;
var myAsteroids = [];
var boundsEnabled;
var myTimer;
var spaceShipSpeed = 0;
var numberOfAsteroids = 0;
var startTime;
var score;

var spaceShipImage = new Image();
spaceShipImage.src = "images/spaceship.png";

var asteroidImage = new Image();
asteroidImage.src = "images/asteroid.png";

// taking values from sliders on startup
document.addEventListener('DOMContentLoaded', (event) => {
  const startModal = document.getElementById('startModal');
  const startButton = document.getElementById('startButton');
  const spaceShipSlider = document.getElementById('SpaceShipSlider');
  const asteroidCountSlider = document.getElementById('AsteroidCountSlider');
  const boundsEnabledCheckbox = document.getElementById('Bounds');

  // block screen until start is clicked
  startModal.style.display = "block";

  startButton.addEventListener('click', function() {
    spaceShipSpeed = parseInt(spaceShipSlider.value);
    numberOfAsteroids = parseInt(asteroidCountSlider.value);
    boundsEnabled = boundsEnabledCheckbox.checked;
    
    // close popup and start game
    startModal.style.display = "none";
    startGame();
  });  
});

// when restart button is clicked show start popup again
document.getElementById('restartButton').addEventListener('click', function() {
  document.getElementById('gameOverModal').style.display = 'none';
  document.getElementById('startModal').style.display = 'block';
});

// check for arrow presses
document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "ArrowUp":
      mySpaceShip.speedY = -spaceShipSpeed;
      break;
    case "ArrowDown":
      mySpaceShip.speedY = spaceShipSpeed;
      break;
    case "ArrowLeft":
      mySpaceShip.speedX = -spaceShipSpeed;
      break;
    case "ArrowRight":
      mySpaceShip.speedX = spaceShipSpeed;
      break;
  }
});

// check for arrow releases
document.addEventListener("keyup", function (e) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
      mySpaceShip.speedY = 0;
      break;
    case "ArrowLeft":
    case "ArrowRight":
      mySpaceShip.speedX = 0;
      break;
  }
});

// create spaceship, asteroids, and timer
function startGame() {
  mySpaceShip = new spaceship(75, 75, spaceShipImage, window.innerWidth/2, window.innerHeight/2);
  myAsteroids = [];
  for (let i = 0; i < numberOfAsteroids; i++) {
    // make random size
    var asteroidSize = Math.random() * (200 - 50);
    // my attempt at making random textures for each asteroid, from texture sheet
    // sometimes textures are smaller that asteroid so hitboxes are wrong
    var asteroidTextureX = Math.random() * (1600 - 0);
    var asteroidTextureY = Math.random() * (800 - 0);
    // create asteroid outside of screen
    myAsteroids.push(new asteroid(asteroidSize, asteroidSize, asteroidTextureX, asteroidTextureY, Math.random() < 0.5 ? -300 : window.innerWidth + 300, Math.random() < 0.5 ? -300 : window.innerHeight + 300));
  }
  myTimer = new timer();
  myGameArea.start();
}


var myGameArea = {
  canvas: document.createElement("canvas"),
  // creating my canvas, template from ppt
  start: function () {
    startTime = new Date().getTime();
    this.canvas.id = "gameCanvas"
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
  },
  stop: function () {
    // added time calculations and storing in stop function from ppt
    var endTime = new Date().getTime();
    score = endTime - startTime;
    if (localStorage.getItem('highScore') === null || score > localStorage.getItem('highScore')) {
      localStorage.setItem('highScore', score);
    }
    clearInterval(this.interval);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// scapeship object, template from "component" in ppt, it was easier to create separate objects for asteroids and spaceship
function spaceship(width, height, image, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = 0;
  this.image = image;

  this.update = function () {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    // insead of fillReact using spaceship image
    ctx.drawImage(spaceShipImage, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;

    // modified from ptt, instad of bouncing and changing speed, wraping around the screen
    // if mySpaceship moved half of its body off screen to the right, swap his x cordinate to oposite side
    if (this.x - this.width / 2 > myGameArea.canvas.width) {
      this.x = -this.width / 2;
    // if mySpaceship moved off screen to the left, move him right
    } else if (this.x + this.width / 2 < 0) {
      this.x = myGameArea.canvas.width + this.width / 2;
    }

    // same for vertical wrap
    if (this.y - this.height / 2 > myGameArea.canvas.height) {
      this.y = -this.height / 2;
    } else if (this.y + this.height / 2 < 0) {
      this.y = myGameArea.canvas.height + this.height / 2;
    }
  }
}

// modified component, but added textureX and Y for attempt at random textures
// created 2 "game modes", one from ppt where asteroids bounce off the screen, and one was generated by chatgpt where asteroids can move off screen
function asteroid(width, height, textureX, textureY, x, y) {
  this.width = width;
  this.height = height;
  this.textureX = textureX;
  this.textureY = textureY;
  this.x = x;
  this.y = y;
  // each asteroid gets random speed
  this.speedX = Math.random() * (20 - 4) + 4;
  this.speedY = Math.random() * (20 - 4) + 4;


  this.update = function () {
    ctx = myGameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(asteroidImage, this.textureX, this.textureY, this.width, this.height, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  // code from ppt was bouncing asteroid of edges of the screen (and some asteroids were pointed out of the screen, so only 20% would appear), i didnt liked that behavior so i asked chatgpt to make another mode where asteroids can move off screen,
  // once they moved off screen their trajectory is reset and returned back with different size, speed and angle, had no idea how would i do it myself
  if (boundsEnabled) {
    this.newPos = function () {
      if (this.x - this.width / 2 < 0)
        this.speedX = Math.random() * (15 - 4) + 4;
      else if ((this.x + this.width / 2) >= myGameArea.context.canvas.width)
        this.speedX = -this.speedX;
      if (this.y - this.height / 2 < 0)
        this.speedY = -this.speedY;
      else if ((this.y + this.height / 2) >= myGameArea.context.canvas.height)
        this.speedY = Math.random() * (15 - 4) + 4;
      this.x += this.speedX;
      this.y -= this.speedY;
    };
    // used chatgpt for this part
    // instead of bouncing objects off the screen allow them to pass are return
  } else {
    this.newPos = function () {
      this.x += this.speedX;
      this.y += this.speedY;
    
      // Check if the asteroid has moved completely off the screen
      if (this.x > myGameArea.canvas.width + this.width || this.x < -this.width ||
          this.y > myGameArea.canvas.height + this.height || this.y < -this.height) {
        this.reset();
      }
    };
    
    this.reset = function () {
      var asteroidSize = Math.random() * (200 - 50);
      var asteroidTextureX = Math.random() * (1600 - 0);
      var asteroidTextureY = Math.random() * (800 - 0);
      this.width = asteroidSize;
      this.height = asteroidSize;
      this.textureX = asteroidTextureX;
      this.textureY = asteroidTextureY;
      // Randomize new starting position
      let side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: // top
          this.x = Math.random() * myGameArea.canvas.width;
          this.y = -this.height;
          break;
        case 1: // right
          this.x = myGameArea.canvas.width + this.width;
          this.y = Math.random() * myGameArea.canvas.height;
          break;
        case 2: // bottom
          this.x = Math.random() * myGameArea.canvas.width;
          this.y = myGameArea.canvas.height + this.height;
          break;
        case 3: // left
          this.x = -this.width;
          this.y = Math.random() * myGameArea.canvas.height;
          break;
      }
    
      // Calculate trajectory towards a random point inside the screen
      let targetX = Math.random() * myGameArea.canvas.width;
      let targetY = Math.random() * myGameArea.canvas.height;
      let deltaX = targetX - this.x;
      let deltaY = targetY - this.y;
      let angle = Math.atan2(deltaY, deltaX);
    
      // Set speed based on angle
      let newSpeed = Math.random() * (10 - 1) + 1; // Adjust speed range as needed
      this.speedX = newSpeed * Math.cos(angle);
      this.speedY = newSpeed * Math.sin(angle);
    };
  }
}

// timer component, write text on screen on each update with new time and old highscore from localstorage
function timer() {
  this.update = function () {
    var currentTime = new Date().getTime();
    var timeElapsed = currentTime - startTime;
    var ctx = myGameArea.context;
    ctx.save();
    ctx.font = "30px Orbitron";
    ctx.fillStyle = "greenyellow";
    var formattedTime = formatScore(timeElapsed);
    var highScore = localStorage.getItem('highScore');
    ctx.fillText("High Score: " + formatScore(highScore || 0), 10, 30);
    ctx.fillText("Score: " + formattedTime, 10, 60);
    ctx.restore();
  }
}

// https://stackoverflow.com/a/7301852
function isCollide(a, b) {
  return !(
      ((a.y + a.height) < (b.y)) ||
      (a.y > (b.y + b.height)) ||
      ((a.x + a.width) < b.x) ||
      (a.x > (b.x + b.width))
  );
}

function formatScore(score) {
  let minutes = Math.floor(score / 60000);
  let seconds = Math.floor(score / 1000);
  let milliseconds = score % 1000;
  return minutes + ":" + seconds + "." + milliseconds;
}

// updating each component, and stoping game if there is collision
function updateGameArea() {
  myGameArea.clear();
  mySpaceShip.newPos();
  mySpaceShip.update();
  myTimer.update();
  for (let i = 0; i < myAsteroids.length; i++) {
    myAsteroids[i].newPos();
    myAsteroids[i].update();
    if (isCollide(mySpaceShip, myAsteroids[i])) {
      myGameArea.stop();
      document.getElementById('gameOverModal').style.display = 'block';
      document.getElementById('highScore').innerText = 'High Score: ' + formatScore(localStorage.getItem('highScore') || 0);
      document.getElementById('score').innerText = 'Your Score: ' + formatScore(score);
      break;
    }
  }
}