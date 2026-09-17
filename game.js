// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ==========================================
// UI
// ==========================================

const scoreEl =
    document.getElementById("score");

const highscoreEl =
    document.getElementById("highscore");

const overlay =
    document.getElementById("overlay");

const overlayTitle =
    document.getElementById("overlayTitle");

const overlaySubtitle =
    document.getElementById("overlaySubtitle");

const overlayAction =
    document.getElementById("overlayAction");


// ==========================================
// CONFIG
// ==========================================

const WIDTH = 900;

const HEIGHT = 550;

const CELL = 20;


// JUMLAH APEL
const MAX_FOOD = 10;


// ==========================================
// GAME STATE
// ==========================================

let snake = [];

let foods = [];

let bigFood = null;

let bigFoodTimer = 0;

let direction = {
    x: 1,
    y: 0
};

let nextDirection = {
    x: 1,
    y: 0
};

let score = 0;

let highscore =
    Number(
        localStorage.getItem(
            "snake_highscore"
        )
    ) || 0;

let speed = 8;

let moveTimer = 0;

let lastTime = 0;

let gameState = "MENU";


// ==========================================
// EFFECT
// ==========================================

let eatEffect = null;

const BIG_FOOD_DURATION = 5000;

const BIG_FOOD_CHANCE = 0.0015;

const EAT_EFFECT_DURATION = 350;


// ==========================================
// SCORE
// ==========================================

highscoreEl.textContent =
    `High Score: ${highscore}`;


// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener(
    "keydown",
    (e) => {

        if (
            gameState === "MENU" ||
            gameState === "GAMEOVER"
        ) {

            if (e.key === "Enter") {

                resetGame();

            }

            return;
        }


        if (e.key === " ") {

            e.preventDefault();

            togglePause();

            return;
        }


        if (
            gameState !== "PLAYING"
        ) {

            return;
        }


        if (e.key === "ArrowUp") {

            setDirection(0, -1);

        }

        else if (
            e.key === "ArrowDown"
        ) {

            setDirection(0, 1);

        }

        else if (
            e.key === "ArrowLeft"
        ) {

            setDirection(-1, 0);

        }

        else if (
            e.key === "ArrowRight"
        ) {

            setDirection(1, 0);

        }

    }
);


// ==========================================
// DIRECTION
// ==========================================

function setDirection(dx, dy) {

    if (
        gameState !== "PLAYING"
    ) {

        return;
    }


    // Tidak boleh langsung balik
    if (
        dx === -direction.x &&
        dy === -direction.y
    ) {

        return;
    }


    nextDirection = {
        x: dx,
        y: dy
    };
}


// ==========================================
// MOBILE BUTTON
// ==========================================

function buttonDirection(
    id,
    dx,
    dy
) {

    const button =
        document.getElementById(id);

    button.addEventListener(
        "pointerdown",
        (e) => {

            e.preventDefault();

            // Kalau masih menu,
            // tombol langsung mulai
            if (
                gameState === "MENU"
            ) {

                resetGame();

            }

            setDirection(dx, dy);

        }
    );
}


buttonDirection(
    "btnUp",
    0,
    -1
);

buttonDirection(
    "btnDown",
    0,
    1
);

buttonDirection(
    "btnLeft",
    -1,
    0
);

buttonDirection(
    "btnRight",
    1,
    0
);


// ==========================================
// PAUSE BUTTON
// ==========================================

document
    .getElementById("btnPause")
    .addEventListener(
        "pointerdown",
        (e) => {

            e.preventDefault();

            togglePause();

        }
    );


// ==========================================
// PAUSE
// ==========================================

function togglePause() {

    if (
        gameState === "PLAYING"
    ) {

        gameState = "PAUSED";

        showOverlay(
            "PAUSED",
            "Game dihentikan sementara",
            "TEKAN PAUSE / SPACE UNTUK LANJUT"
        );

    }

    else if (
        gameState === "PAUSED"
    ) {

        gameState = "PLAYING";

        hideOverlay();

    }
}


// ==========================================
// OVERLAY
// ==========================================

overlay.addEventListener(
    "pointerdown",
    () => {

        if (
            gameState === "MENU" ||
            gameState === "GAMEOVER"
        ) {

            resetGame();

        }

        else if (
            gameState === "PAUSED"
        ) {

            togglePause();

        }

    }
);


// ==========================================
// CREATE FOOD
// ==========================================

function createFood() {

    let attempts = 0;


    while (
        attempts < 1000
    ) {

        attempts++;


        const x =
            Math.floor(
                Math.random() *
                (WIDTH / CELL)
            ) * CELL;


        const y =
            Math.floor(
                Math.random() *
                (HEIGHT / CELL)
            ) * CELL;


        // Cek ular
        const onSnake =
            snake.some(
                segment =>
                    segment.x === x &&
                    segment.y === y
            );


        // Cek apel lain
        const onFood =
            foods.some(
                food =>
                    food.x === x &&
                    food.y === y
            );


        if (
            !onSnake &&
            !onFood
        ) {

            return {
                x,
                y
            };

        }

    }


    return null;
}


// ==========================================
// ISI APEL
// ==========================================

function fillFoods() {

    while (
        foods.length < MAX_FOOD
    ) {

        const newApple =
            createFood();

        if (!newApple) {
            break;
        }

        foods.push(newApple);

    }
}


// ==========================================
// BIG FOOD
// ==========================================

function createBigFood() {

    let attempts = 0;


    while (
        attempts < 1000
    ) {

        attempts++;


        const x =
            Math.floor(
                Math.random() *
                ((WIDTH / CELL) - 2)
            ) * CELL;


        const y =
            Math.floor(
                Math.random() *
                ((HEIGHT / CELL) - 2)
            ) * CELL;


        const onSnake =
            snake.some(
                segment =>
                    segment.x >= x &&
                    segment.x < x + 40 &&
                    segment.y >= y &&
                    segment.y < y + 40
            );


        const onFood =
            foods.some(
                food =>
                    food.x >= x &&
                    food.x < x + 40 &&
                    food.y >= y &&
                    food.y < y + 40
            );


        if (
            !onSnake &&
            !onFood
        ) {

            return {
                x,
                y
            };

        }

    }


    return null;
}


// ==========================================
// RESET
// ==========================================

function resetGame() {

    snake = [

        {
            x: 400,
            y: 300
        },

        {
            x: 380,
            y: 300
        },

        {
            x: 360,
            y: 300
        },

        {
            x: 340,
            y: 300
        }

    ];


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    score = 0;

    speed = 8;

    moveTimer = 0;

    foods = [];

    bigFood = null;

    bigFoodTimer = 0;

    eatEffect = null;


    // Buat 10 apel
    fillFoods();


    scoreEl.textContent =
        "Score: 0";


    gameState = "PLAYING";

    hideOverlay();

}


// ==========================================
// MOVE SNAKE
// ==========================================

function moveSnake() {

    direction = {
        ...nextDirection
    };


    const head = {

        x:
            snake[0].x +
            direction.x * CELL,

        y:
            snake[0].y +
            direction.y * CELL

    };


    // Tabrak tembok
    if (
        head.x < 0 ||
        head.x >= WIDTH ||
        head.y < 0 ||
        head.y >= HEIGHT
    ) {

        triggerGameOver();

        return;

    }


    // Tabrak badan
    const hitsBody =
        snake.some(
            segment =>
                segment.x === head.x &&
                segment.y === head.y
        );


    if (hitsBody) {

        triggerGameOver();

        return;

    }


    snake.unshift(head);


    // ======================================
    // BIG FOOD
    // ======================================

    const ateBigFood =
        bigFood &&
        head.x >= bigFood.x &&
        head.x < bigFood.x + 40 &&
        head.y >= bigFood.y &&
        head.y < bigFood.y + 40;


    if (ateBigFood) {

        for (
            let i = 0;
            i < 5;
            i++
        ) {

            snake.push({
                ...snake[
                    snake.length - 1
                ]
            });

        }


        score += 5;

        updateScore();


        bigFood = null;

        bigFoodTimer = 0;

        speed =
            Math.min(
                20,
                8 +
                Math.floor(score / 3)
            );


        return;
    }


    // ======================================
    // APEL
    // ======================================

    const foodIndex =
        foods.findIndex(
            food =>
                food.x === head.x &&
                food.y === head.y
        );


    if (
        foodIndex !== -1
    ) {

        const eaten =
            foods[foodIndex];


        // Efek makan
        eatEffect = {

            x:
                eaten.x +
                CELL / 2,

            y:
                eaten.y +
                CELL / 2,

            timer:
                EAT_EFFECT_DURATION

        };


        // Hapus apel
        foods.splice(
            foodIndex,
            1
        );


        score += 1;

        updateScore();


        speed =
            Math.min(
                20,
                8 +
                Math.floor(score / 3)
            );


        // Spawn apel baru
        fillFoods();


    }

    else {

        // Tidak makan
        snake.pop();

    }

}


// ==========================================
// SCORE
// ==========================================

function updateScore() {

    scoreEl.textContent =
        `Score: ${score}`;


    if (
        score > highscore
    ) {

        highscore = score;


        localStorage.setItem(
            "snake_highscore",
            highscore
        );


        highscoreEl.textContent =
            `High Score: ${highscore}`;

    }

}


// ==========================================
// GAME OVER
// ==========================================

function triggerGameOver() {

    gameState = "GAMEOVER";


    showOverlay(
        "GAME OVER",
        `Score Akhir: ${score}`,
        "TEKAN ENTER ATAU KLIK UNTUK MAIN LAGI"
    );

}


// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

    ctx.fillStyle =
        "#23642d";

    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    ctx.strokeStyle =
        "#2a7334";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < WIDTH;
        x += CELL
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            HEIGHT
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < HEIGHT;
        y += CELL
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            WIDTH,
            y
        );

        ctx.stroke();

    }

}


// ==========================================
// DRAW APEL
// ==========================================

function drawFood() {

    foods.forEach(
        food => {

            const x = food.x;

            const y = food.y;


            // Shadow
            ctx.fillStyle =
                "rgba(20,50,20,0.5)";

            ctx.beginPath();

            ctx.ellipse(
                x + 10,
                y + 17,
                8,
                4,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Apel
            ctx.fillStyle =
                "#821414";

            ctx.beginPath();

            ctx.arc(
                x + 10,
                y + 10,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "#dc2828";

            ctx.beginPath();

            ctx.arc(
                x + 8,
                y + 8,
                8,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Highlight
            ctx.fillStyle =
                "#ff8282";

            ctx.beginPath();

            ctx.arc(
                x + 5,
                y + 5,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // Batang
            ctx.strokeStyle =
                "#502d14";

            ctx.lineWidth = 2;

            ctx.beginPath();

            ctx.moveTo(
                x + 10,
                y + 2
            );

            ctx.lineTo(
                x + 12,
                y - 4
            );

            ctx.stroke();


            // Daun
            ctx.fillStyle =
                "#64dc64";

            ctx.beginPath();

            ctx.ellipse(
                x + 13,
                y - 4,
                4,
                2,
                Math.PI / 4,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// ==========================================
// BIG FOOD
// ==========================================

function drawBigFood() {

    if (!bigFood) {
        return;
    }


    const x = bigFood.x;

    const y = bigFood.y;


    ctx.strokeStyle =
        "#ffd700";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
        x + 20,
        y + 20,
        24,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.fillStyle =
        "#dc2828";

    ctx.beginPath();

    ctx.arc(
        x + 20,
        y + 20,
        18,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#ff9696";

    ctx.beginPath();

    ctx.arc(
        x + 14,
        y + 14,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


// ==========================================
// EFFECT
// ==========================================

function drawEatEffect(dt) {

    if (!eatEffect) {
        return;
    }


    eatEffect.timer -= dt;


    if (
        eatEffect.timer <= 0
    ) {

        eatEffect = null;

        return;
    }


    const progress =
        1 -
        (
            eatEffect.timer /
            EAT_EFFECT_DURATION
        );


    const radius =
        8 +
        progress * 35;


    const alpha =
        1 - progress;


    ctx.save();


    ctx.strokeStyle =
        `rgba(255,220,40,${alpha})`;

    ctx.lineWidth = 3;


    ctx.beginPath();

    ctx.arc(
        eatEffect.x,
        eatEffect.y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const angle =
            i / 8 *
            Math.PI *
            2;


        const distance =
            10 +
            progress * 30;


        const px =
            eatEffect.x +
            Math.cos(angle) *
            distance;


        const py =
            eatEffect.y +
            Math.sin(angle) *
            distance;


        ctx.fillStyle =
            `rgba(255,240,100,${alpha})`;


        ctx.beginPath();

        ctx.arc(
            px,
            py,
            Math.max(
                1,
                4 -
                progress * 3
            ),
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


// ==========================================
// SNAKE
// ==========================================

function drawSnake() {

    if (
        snake.length === 0
    ) {
        return;
    }


    // Body
    for (
        let i = snake.length - 1;
        i > 0;
        i--
    ) {

        const segment =
            snake[i];


        ctx.fillStyle =
            "#2daa41";

        ctx.beginPath();

        ctx.arc(
            segment.x + 10,
            segment.y + 10,
            9,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#64dc64";

        ctx.beginPath();

        ctx.arc(
            segment.x + 7,
            segment.y + 7,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // Head
    const head =
        snake[0];


    ctx.fillStyle =
        "#145f23";

    ctx.beginPath();

    ctx.arc(
        head.x + 10,
        head.y + 10,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#2daa41";

    ctx.beginPath();

    ctx.arc(
        head.x + 10,
        head.y + 10,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ======================================
    // EYES
    // ======================================

    let eye1 = {
        x: head.x + 5,
        y: head.y + 5
    };

    let eye2 = {
        x: head.x + 15,
        y: head.y + 5
    };


    if (
        direction.x === 1
    ) {

        eye1 = {
            x: head.x + 15,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 15
        };

    }

    else if (
        direction.x === -1
    ) {

        eye1 = {
            x: head.x + 5,
            y: head.y + 5
        };

        eye2 = {
            x: head.x + 5,
            y: head.y + 15
        };

    }

    else if (
        direction.y === 1
    ) {

        eye1 = {
            x: head.x + 5,
            y: head.y + 15
        };

        eye2 = {
            x: head.x + 15,
            y: head.y + 15
        };

    }


    [eye1, eye2].forEach(
        eye => {

            ctx.fillStyle =
                "white";

            ctx.beginPath();

            ctx.arc(
                eye.x,
                eye.y,
                3.5,
                0,
                Math.PI * 2
            );

            ctx.fill();


            ctx.fillStyle =
                "black";

            ctx.beginPath();

            ctx.arc(
                eye.x,
                eye.y,
                1.8,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );

}


// ==========================================
// OVERLAY
// ==========================================

function showOverlay(
    title,
    subtitle,
    action
) {

    overlayTitle.textContent =
        title;

    overlaySubtitle.textContent =
        subtitle;

    overlayAction.textContent =
        action;

    overlay.style.display =
        "flex";

}


function hideOverlay() {

    overlay.style.display =
        "none";

}


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(timestamp) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    const dt =
        timestamp -
        lastTime;


    lastTime =
        timestamp;


    if (
        gameState === "PLAYING"
    ) {

        moveTimer += dt;


        // Big apple muncul acak
        if (
            !bigFood &&
            Math.random() <
            BIG_FOOD_CHANCE
        ) {

            bigFood =
                createBigFood();


            if (bigFood) {

                bigFoodTimer =
                    BIG_FOOD_DURATION;

            }

        }


        // Timer big apple
        if (bigFood) {

            bigFoodTimer -= dt;


            if (
                bigFoodTimer <= 0
            ) {

                bigFood = null;

                bigFoodTimer = 0;

            }

        }


        // Gerakan ular
        const delay =
            1000 / speed;


        if (
            moveTimer >= delay
        ) {

            moveTimer = 0;

            moveSnake();

        }

    }


    // Draw
    drawBackground();

    drawFood();

    drawBigFood();

    drawEatEffect(dt);


    if (
        gameState !== "MENU"
    ) {

        drawSnake();

    }


    requestAnimationFrame(
        gameLoop
    );

}


// ==========================================
// START
// ==========================================

requestAnimationFrame(
    gameLoop
);
