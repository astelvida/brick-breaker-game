window.canvas = document.getElementById('myCanvas');
window.ctx = canvas.getContext('2d');

canvas.width = 480; // default: 300px;
canvas.height = 320; // default: 150px;

const W = canvas.width;
const H = canvas.height;

let gameStarted = null;
let score = 0;
let lives = 3;

let rightPressed = false;
let leftPressed = false;

const keyDownHandler = (e) => {
    rightPressed = e.keyCode === 39 ? true : false;
    leftPressed = e.keyCode === 37 ? true : false;
};

const keyUpHandler = (e) => {
    if (!gameStarted) {
        gameStarted = true;
    }
    rightPressed = e.keyCode === 39 ? false : false;
    leftPressed = e.keyCode === 37 ? false : false;
};

const mouseMoveHandler = (e) => {
    const paddleMidPoint = paddleWidth / 2;
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleMidPoint;
    }
};

document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
const generateBricks = () => {
    for (let r = 0; r < brickRowCount; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[r][c] = {};
            const brick = bricks[r][c];
            brick.x = c * (brickPadding + brickWidth) + brickOffsetLeft;
            brick.y = r * (brickPadding + brickHeight) + brickOffsetTop;
            brick.status = 1;
        }
    }
}

const printCtxCoords = (ctx, x, y, ctxWidth, ctxHeight) => {
    const text = `(${x}, ${y})`;
    ctx.font = '11px arial';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    textX = x + ctxWidth / 2 - ctx.measureText(text).width / 2;
    textY = y + ctxHeight / 2;
    ctx.fillText(text, textX, textY);
};

const drawBrick = (brick) => {
    ctx.beginPath();
    const { x, y } = brick;
    ctx.rect(x, y, brickWidth, brickHeight);
    ctx.fillStyle = '#3F51B5';
    ctx.fill();
    // Enable for debugging
    // printCtxCoords(ctx, x, y, brickWidth, brickHeight);
    ctx.closePath();
}

const drawAllBricks = () => {
    bricks.forEach(brickRow =>
        brickRow.forEach((brick) => {
            if (brick.status) {
                drawBrick(brick);
            }
        })
    );
}

let x = W / 2;
let y = H - 30;
let dx = 2;
let dy = -2;
let ballRadius = 10;

const drawBall = () => {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#EF5350';
    ctx.fill();
    ctx.closePath();
};

const paddleWidth = 75;
const paddleHeight = 10;
let paddleX = (W - paddleWidth) / 2;

const drawPaddle = () => {
    ctx.beginPath();
    ctx.rect(paddleX, H - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = '#3F51B5';
    ctx.fill();
    ctx.closePath();
};

const checkCollision = () => {
    bricks.forEach(brickRow =>
        brickRow.forEach((brick) => {
            if (brick.status) {
                if (y > brick.y && y < brick.y + brickHeight &&
                    x + ballRadius > brick.x && x - ballRadius < brick.x + brickWidth) {
                    dy = -dy;
                    brick.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        console.log('YOU WIN, CONGRATULATIONS!');
                        document.location.reload();
                    }
                }
            }
        })
    );
}


const drawScore = () => {
    ctx.font = '15px Arial';
    ctx.fillStyle = '#FF9800';
    ctx.fillText(`Score: ${score}`, 8, 16);
}

const drawLives = () => {
    ctx.font = '15px Arial';
    ctx.fillStyle = '#4CAF50';
    const text = `Lives: ${lives}`;
    ctx.fillText(text, canvas.width - ctx.measureText(text).width - 8, 16);
}

const handleGame = () => {
    // handle Right and Left wall
    if (x + dx < ballRadius || x + dx > W - ballRadius) {
        dx = -dx;
    }

    // handle Top and Bottom wall
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > H - ballRadius - paddleHeight) {
        if (x > paddleX  && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (lives > 0) {
            lives--;
            gameStarted = false;
            console.log('LIFES LEFT:', lives);
        } else {
            gameStarted = false;
            console.log('GAME ENDED');
        }
    };

    if (rightPressed && paddleX < W - paddleWidth) {
        paddleX += 7;
    }

    if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;
}

const restoreBricks = () => {
    bricks.forEach(brickRow =>
        brickRow.forEach(brick => brick.status = 1));
}

const resetGame = () => {
    x = W / 2;
    y = H - 30;
    paddleX = (W - 75) / 2;
    if (lives === 0) {
        score = 0;
        lives = 3;
        restoreBricks();
    }
}

generateBricks();

const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAllBricks();
    checkCollision();
    drawPaddle();
    drawBall();
    drawScore();
    drawLives();

    if (gameStarted === true) {
        handleGame();
    } else if (gameStarted === false) {
        resetGame();
    }

    window.requestAnimationFrame(draw);
}

draw();
