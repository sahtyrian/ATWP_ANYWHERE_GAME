document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const backgroundMusic = document.getElementById('background-music');

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none'; // Hide the start screen
        backgroundMusic.play(); // Start playing background music
        initializeGame(); // Initialize the game
    });
});

// Constants for elements and initial settings
const car = document.getElementById('car');
const gameContainer = document.getElementById('game-container');
const startMusicButton = document.getElementById('start-music');
const background = document.getElementById('background');
const background2 = document.getElementById('background2');
const collisionSound = new Audio('collision.mp3');
const pointearnedSound = new Audio('point_earned.mp3');
const carRevSound = new Audio('revup.mp3');
const carskidSound = new Audio('car skid.mp3');
const carwhooshSound = new Audio('whoosh.mp3');
const containerWidth = gameContainer.offsetWidth;
const containerHeight = gameContainer.offsetHeight;
const carWidth = 100;
const carHeight = 50;
const minInterval = 500;
const maxSpeed = 20;
const maxObstacleSpeed = 5;
const maxObstacleCount = 12;
let score = 0;
let obstacleCount = 1;
let keyHeldHorizontal = false;
let keyHeldVertical = false;
let obstacleSpeed = 1; // Initial speed of obstacles (pixels per movement)
let obstacleInterval = 2000; // Initial interval between obstacle spawns (in milliseconds)
let carSpeed = 20; // Initial speed of the car (pixels per movement)

// Initialize score counter HTML element
const scoreCounter = document.createElement('div');
scoreCounter.id = 'score-counter';
scoreCounter.textContent = 'Score: 0';
scoreCounter.style.position = 'absolute';
scoreCounter.style.top = '20px';
scoreCounter.style.left = '20px';
document.body.appendChild(scoreCounter);

// Function to initialize car position and background scrolling
function initialize(containerWidth, containerHeight, background, background2) {
    // Car initial position
    const carWidth = 100; // Set car width
    const carHeight = 50; // Set car height
    car.style.left = (containerWidth - carWidth) / 1.89 + 'px';
    car.style.top = (containerHeight - carHeight) / 2.5 + 'px';

    // Background scrolling
    let xPos = 0;
    let lastScrollTime = Date.now();
    const scrollSpeed = 250;

    function scrollBackground() {
        const currentTime = Date.now();
        const timeDiff = currentTime - lastScrollTime;
        const distance = scrollSpeed * (timeDiff / 300);

        xPos -= distance;
        background.style.backgroundPosition = `${xPos}px 0`;
        background2.style.backgroundPosition = `${xPos + background.offsetWidth}px 0`;

        if (xPos <= -background.offsetWidth) {
            xPos += background.offsetWidth;
        }

        lastScrollTime = currentTime;
    }

    setInterval(scrollBackground, 40);
}

// Call the initialize function with the necessary parameters
initialize(containerWidth, containerHeight, background, background2);

// Event listeners for car movement
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        keyHeldVertical = 'left';
        car.src = 'car_image_2.png';
    } else if (event.key === 'ArrowRight') {
        keyHeldVertical = 'right';
    } else if (event.key === 'ArrowUp') {
        keyHeldHorizontal = 'up';
    } else if (event.key === 'ArrowDown') {
        keyHeldHorizontal = 'down';
        car.src = 'car_image_3.png';
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        keyHeldVertical = false;
        car.src = 'car_image.png';
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        keyHeldHorizontal = false;
        car.src = 'car_image.png';
    }
});

// Function to move the car continuously while keys are held down
function moveCar() {
    const carLeft = parseInt(window.getComputedStyle(car).getPropertyValue('left'));
    const carTop = parseInt(window.getComputedStyle(car).getPropertyValue('top'));

    const maxTop = containerHeight * 0.20;
    const maxBottom = containerHeight * 0.78;

    if (keyHeldHorizontal === 'up' && carTop > maxTop) {
        car.style.top = carTop - maxSpeed + 'px';
    } else if (keyHeldHorizontal === 'down' && carTop < maxBottom) {
        car.style.top = carTop + maxSpeed + 'px';
        carwhooshSound.play();
    }

    if (keyHeldVertical === 'left' && carLeft > 0) {
        car.style.left = carLeft - maxSpeed + 'px';
        carskidSound.play();
    } else if (keyHeldVertical === 'right' && carLeft < containerWidth - carWidth) {
        car.style.left = carLeft + maxSpeed + 'px';
        carRevSound.play();
    }
}

setInterval(moveCar, 50);

// Event listeners for directional pad buttons
document.querySelectorAll('#directional-pad button').forEach(button => {
    button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        handleDirectionalPad(event.target.dataset.direction, true);
    });
    button.addEventListener('touchstart', (event) => {
        event.preventDefault();
        handleDirectionalPad(event.target.dataset.direction, true);
    });
    button.addEventListener('mouseup', () => {
        handleDirectionalPad(null, false);
    });
    button.addEventListener('touchend', () => {
        handleDirectionalPad(null, false);
    });
});

// Function to handle directional pad input
const handleDirectionalPad = (direction, isPressed) => {
    if (direction === 'up') {
        keyHeldHorizontal = isPressed ? 'up' : false;
    } else if (direction === 'down') {
        keyHeldHorizontal = isPressed ? 'down' : false;
        car.src = isPressed ? 'car_image_3.png' : 'car_image.png';
    } else if (direction === 'left') {
        keyHeldVertical = isPressed ? 'left' : false;
        car.src = isPressed ? 'car_image_2.png' : 'car_image.png';
    } else if (direction === 'right') {
        keyHeldVertical = isPressed ? 'right' : false;
    }
};

// Function to handle button down event
function handleButtonDown(direction) {
    handleDirectionalPad(direction, true);
}

// Function to handle button up event
function handleButtonUp(direction) {
    handleDirectionalPad(direction, false);
}


// Function to create obstacles
function createObstacle() {
    // Create original obstacles
    for (let i = 0; i < obstacleCount; i++) {
        const obstacle = document.createElement('img'); // Use img element instead of div
        obstacle.src = 'arrow.png'; // Set the source of the image
        obstacle.classList.add('obstacle');
        obstacle.style.width = '50px'; // Set the width of the image
        obstacle.style.height = '50px'; // Set the height of the image
        obstacle.style.left = Math.random() * (containerWidth - 50) + 'px'; // Random horizontal position
        obstacle.style.top = '-75px'; // Start above the game container
        gameContainer.appendChild(obstacle);
        
        // Generate a random speed for the obstacle
        const obstacleSpeed = Math.random() * (maxObstacleSpeed - 1) + 1; // Random speed between 1 and maxObstacleSpeed

        const obstacleMoveInterval = setInterval(() => {
            const obstacleTop = parseInt(window.getComputedStyle(obstacle).getPropertyValue('top'));
            obstacle.style.top = obstacleTop + obstacleSpeed + 'px'; // Move the obstacle down

            if (obstacleTop > containerHeight) {
                obstacle.remove();
                score++;
                scoreCounter.textContent = 'Score: ' + score; // Update score counter
                pointearnedSound.play(); // Play sound when a point is earned
            }

            checkCollision(car, obstacle, obstacleMoveInterval); // Call the collision detection function
        }, 10);
        
    }

    // Create obstacles from left and right sides
    for (let i = 0; i < obstacleCount; i++) {
        const obstacle = document.createElement('img'); // Use img element instead of div
        obstacle.src = 'police.png'; // Set the source of the image
        obstacle.classList.add('obstacle');
        obstacle.style.width = '50px'; // Set the width of the image
        obstacle.style.height = '50px'; // Set the height of the image
        
        // Randomly determine if the obstacle comes from the left or right
        const fromLeft = Math.random() < 0.5;
        if (fromLeft) {
            obstacle.style.left = '-20px'; // Start from the left side
        } else {
            obstacle.style.left = containerWidth + 'px'; // Start from the right side
        }
        
        obstacle.style.top = Math.random() * (containerHeight - 20) + 'px'; // Random vertical position
        obstacle.style.backgroundColor = 'none'; // Set obstacle color to orange
        gameContainer.appendChild(obstacle);

        // Generate a random speed for the obstacle
        const obstacleSpeed = Math.random() * (maxObstacleSpeed - 1) + 1; // Random speed between 1 and maxObstacleSpeed

        const obstacleMoveInterval = setInterval(() => {
            const obstacleLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue('left'));
            const obstacleTop = parseInt(window.getComputedStyle(obstacle).getPropertyValue('top'));

            if (fromLeft) {
                obstacle.style.left = obstacleLeft + obstacleSpeed + 'px'; // Move the obstacle from left to right
            } else {
                obstacle.style.left = obstacleLeft - obstacleSpeed + 'px'; // Move the obstacle from right to left
            }

            if (obstacleLeft < -20 || obstacleLeft > containerWidth) {
                obstacle.remove();
                score++;
                scoreCounter.textContent = 'Score: ' + score; // Update score counter
                clearInterval(obstacleMoveInterval);
            }

            checkCollision(car, obstacle, obstacleMoveInterval); // Call the collision detection function
        }, 10);
    }
}

// Function to create a diagonal obstacle
function createDiagonalObstacle() {
    const diagonalObstacle = document.createElement('img'); // Use img element instead of div
    diagonalObstacle.src = 'thunder.png'; // Set the source of the image
    diagonalObstacle.classList.add('obstacle');
    diagonalObstacle.style.width = '50px'; // Set the width of the image
    diagonalObstacle.style.height = '50px'; // Set the height of the image
    diagonalObstacle.style.left = 'calc(50% - 25px)'; // Start at the horizontal center
    diagonalObstacle.style.top = '-50px'; // Start above the game container
    gameContainer.appendChild(diagonalObstacle);

    // Set initial position and angle
    let posX = containerWidth / 2;
    let posY = -50;
    let angle = Math.random() * 180; // Set initial angle randomly

    // Move the diagonal obstacle diagonally
    const diagonalMoveInterval = setInterval(() => {
        // Calculate new position
        posX += Math.cos(angle * Math.PI / 180); // Calculate new X position based on angle
        posY += Math.sin(angle * Math.PI / 180); // Calculate new Y position based on angle

        // Update obstacle position
        diagonalObstacle.style.left = posX + 'px';
        diagonalObstacle.style.top = posY + 'px';

        // Check if obstacle is out of bounds
        if (posY > containerHeight) {
            diagonalObstacle.remove();
            clearInterval(diagonalMoveInterval);
        }

        checkCollision(car, diagonalObstacle, diagonalMoveInterval); // Call the collision detection function
    }, 10);
}

// Interval to create diagonal obstacles at the specified interval
setInterval(createDiagonalObstacle, obstacleInterval);

// Interval to increase obstacle count every 15 seconds
setInterval(increaseObstacleCount, 15000);

// Interval to create obstacles at the specified interval
setInterval(createObstacle, obstacleInterval);

// Function to increase obstacle count
function increaseObstacleCount() {
    if (obstacleCount < maxObstacleCount) {
        obstacleCount += 1; // Increase the number of obstacles by 1
    }
}

// Function to check collision between car and obstacle
function checkCollision(car, obstacle, obstacleMoveInterval) {
    // Get the bounding rectangle of the car and obstacle
    const carRect = car.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // Adjust the collision detection margins to control sensitivity
    const marginX = 30; // Example: Increase margin for less sensitivity in the X-axis
    const marginY = 50; // Example: Increase margin for less sensitivity in the Y-axis

    // Check if the bounding rectangles of the car and obstacle intersect with adjusted margins
    if (
        carRect.top + marginY < obstacleRect.bottom && // Check top boundary
        carRect.bottom - marginY > obstacleRect.top && // Check bottom boundary
        carRect.left + marginX < obstacleRect.right && // Check left boundary
        carRect.right - marginX > obstacleRect.left    // Check right boundary
    ) {
   
        clearInterval(obstacleMoveInterval); // Stop obstacle movement
           collisionSound.play();
   
        alert(`Game over! Your score is ${score}`);
        window.location.reload(); // Reload the game
    }
}


// Initialize the game
initialize();

