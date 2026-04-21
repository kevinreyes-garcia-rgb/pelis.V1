const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 175, y: 450, w: 50, h: 80, img: new Image() };
let enemy = { x: 175, y: 100, w: 50, h: 80, img: new Image(), speed: 2 };
let roadImg = new Image();
let roadY = 0;

function startGame(playerSrc, enemySrc) {
    document.getElementById('menu').style.display = 'none';
    canvas.style.display = 'block';

    player.img.src = 'images/' + playerSrc;
    enemy.img.src = 'images/' + enemySrc;
    roadImg.src = 'images/carretera.png';

    update();
}

// Control del jugador
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft" && player.x > 50) player.x -= 15;
    if (e.key === "ArrowRight" && player.x < 300) player.x += 15;
});

function update() {
    // 1. Mover carretera (Efecto infinito)
    roadY += 5;
    if (roadY >= canvas.height) roadY = 0;

    // 2. Inteligencia simple del enemigo (escapar o mantenerse)
    enemy.y += Math.sin(Date.now() / 500) * 2; // El enemigo zigzaguea un poco
    
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo doble para el scroll infinito
    ctx.drawImage(roadImg, 0, roadY, canvas.width, canvas.height);
    ctx.drawImage(roadImg, 0, roadY - canvas.height, canvas.width, canvas.height);

    // Dibujar autos
    ctx.drawImage(player.img, player.x, player.y, player.w, player.h);
    ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.w, enemy.h);
}