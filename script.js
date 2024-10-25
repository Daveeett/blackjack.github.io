
var saldo = 0;
var apuestaActual = 0;
var numJugadores = 1;
var jugadorActual = 0;
var cartasJugadores = [[], [], []];
var cartasCrupier = [];
var canvasJugadores = [];
var ctxJugadores = [];
var canvasCrupier;
var ctxCrupier;
var saldos = [10000]; // El primer saldo es el del crupier, inicializado con 10000
var apuestas = [0]; // La primera apuesta es la del crupier

function depositarDinero() {
    var deposito = parseInt(document.getElementById("deposito").value);
    if (isNaN(deposito) || deposito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }
    saldo += deposito;
    actualizarSaldo();
    document.getElementById("apuesta").disabled = false;
    document.getElementById("botonApostar").disabled = false;
}

function apostar() {
    var apuesta = parseInt(document.getElementById("apuesta").value);
    if (isNaN(apuesta) || apuesta <= 0 || apuesta > saldo) {
        alert("Por favor, ingrese una apuesta válida.");
        return;
    }
    apuestaActual = apuesta;
    saldo -= apuesta;
    actualizarSaldo();
    document.getElementById("setup-container").style.display = "block";
    document.getElementById("apuestas-container").style.display = "none";
}

function actualizarSaldo() {
    document.getElementById("saldo").innerHTML = "Saldo: $" + saldo;
}

function iniciarJuego() {
    numJugadores = parseInt(document.getElementById("num-jugadores").value);
    if (numJugadores < 1 || numJugadores > 3) {
        alert("El número de jugadores debe ser entre 1 y 3.");
        return;
    }

    // Inicializar saldos y apuestas para cada jugador si es la primera vez
    if (saldos.length === 1) { // Solo el crupier tiene saldo
        for (let i = 0; i < numJugadores; i++) {
            saldos.push(0);
            apuestas.push(0);
        }
        generarCamposDeposito();
    } else {
        generarCamposApuesta();
    }

    actualizarSaldos();

    document.getElementById("setup-container").style.display = "none";
    document.getElementById("apuestas-container").style.display = "block";
}

function generarCamposDeposito() {
    let depositosContainer = document.getElementById("depositos-container");
    depositosContainer.innerHTML = "";
    for (let i = 1; i <= numJugadores; i++) {
        depositosContainer.innerHTML += `
            <div class="deposito-box">
                <label for="deposito-${i}">Depósito Jugador ${i}:</label>
                <input type="number" id="deposito-${i}" placeholder="Ingresa tu depósito">
                <button onclick="depositarDinero(${i})">Depositar</button>
            </div>
        `;
    }
}

function depositarDinero(jugador) {
    let deposito = parseInt(document.getElementById(`deposito-${jugador}`).value);
    if (isNaN(deposito) || deposito <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }
    saldos[jugador] += deposito;
    actualizarSaldos();
    verificarDepositosCompletos();
}

function verificarDepositosCompletos() {
    let todosDepositaron = saldos.slice(1).every(saldo => saldo > 0);
    if (todosDepositaron) {
        generarCamposApuesta();
        document.getElementById("botonApostar").disabled = false;
    }
}

function generarCamposApuesta() {
    let apuestasContainer = document.getElementById("apuestas-jugadores-container");
    apuestasContainer.innerHTML = "";
    for (let i = 1; i <= numJugadores; i++) {
        apuestasContainer.innerHTML += `
            <div class="apuesta-box">
                <label for="apuesta-${i}">Apuesta Jugador ${i} (Saldo: $${saldos[i]}):</label>
                <input type="number" id="apuesta-${i}" placeholder="Ingresa tu apuesta" max="${saldos[i]}">
            </div>
        `;
    }
    document.getElementById("botonApostar").disabled = false;
}

function realizarApuestas() {
    console.log("Función realizarApuestas() llamada");

    for (let i = 1; i <= numJugadores; i++) {
        let apuestaInput = document.getElementById(`apuesta-${i}`);
        if (!apuestaInput || apuestaInput.value === "") {
            alert(`Por favor, ingrese una apuesta para el Jugador ${i}`);
            return;
        }
        let apuesta = parseInt(apuestaInput.value);
        if (isNaN(apuesta) || apuesta <= 0 || apuesta > saldos[i]) {
            alert(`Apuesta inválida para el Jugador ${i}. Debe ser un número positivo no mayor a su saldo actual.`);
            return;
        }
        apuestas[i] = apuesta;
    }

    // Apuesta del crupier (entre la apuesta mínima y máxima de los jugadores)
    let minApuesta = Math.min(...apuestas.slice(1));
    let maxApuesta = Math.max(...apuestas.slice(1));
    apuestas[0] = Math.floor(Math.random() * (maxApuesta - minApuesta + 1)) + minApuesta;

    console.log("Apuestas realizadas:", apuestas);
    console.log("Saldos actualizados:", saldos);

    mostrarSaldosYApuestas();
    iniciarPartida();
}

function actualizarSaldos() {
    let saldosContainer = document.getElementById("saldos-container");
    saldosContainer.innerHTML = `<p>Saldo Crupier: $${saldos[0]}</p>`;
    for (let i = 1; i <= numJugadores; i++) {
        saldosContainer.innerHTML += `<p>Saldo Jugador ${i}: $${saldos[i]}</p>`;
    }
}

function iniciarPartida() {
    console.log("Iniciando partida"); // Para depuración

    document.getElementById("apuestas-container").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    
    // Mostrar u ocultar los contenedores de los jugadores según el número de jugadores
    for (let i = 1; i <= 3; i++) {
        let playerZone = document.getElementById(`player${i}`);
        if (i <= numJugadores) {
            playerZone.style.display = "block";
        } else {
            playerZone.style.display = "none";
        }
    }
    
    inicializarCanvas();
    barajarCartas();
    mostrarSaldosYApuestas();
    repartirCartasIniciales();
}

function inicializarCanvas() {
    canvasJugadores = [];
    ctxJugadores = [];
    for (let i = 1; i <= numJugadores; i++) {
        let canvas = document.getElementById("canvas" + i);
        canvas.width = canvas.offsetWidth;
        canvas.height = 250;
        canvasJugadores.push(canvas);
        ctxJugadores.push(canvas.getContext("2d"));
    }

    canvasCrupier = document.getElementById("canvasDealer");
    canvasCrupier.width = canvasCrupier.offsetWidth;
    canvasCrupier.height = 250;
    ctxCrupier = canvasCrupier.getContext("2d");
}

class Carta {
    constructor(valor, palo) {
        this.img = new Image();
        this.valor = valor;
        this.palo = palo;
    }
}

var cartas = [];
var indiceCarta = 0;
var palos = ["S", "H", "D", "C"];

// Generamos las cartas
for (let i = 0; i < 4; i++) {
    for (let j = 1; j <= 13; j++) {
        cartas.push(new Carta(j, palos[i]));
    }
}

function barajarCartas() {
    for (let i = 0; i < 100; i++) {
        cartas.splice(Math.random() * 52, 0, cartas[0]);
        cartas.shift();
    }
}

function dibujarCarta(carta, ctx, x, y) {
    return new Promise((resolve) => {
        carta.img.onload = () => {
            let canvasWidth = ctx.canvas.width;
            let canvasHeight = ctx.canvas.height;
            let cardWidth = canvasHeight * 0.4; // 40% de la altura del canvas
            let cardHeight = cardWidth * 1.4; // Mantener la proporción de la carta
            ctx.drawImage(carta.img, x, y, cardWidth, cardHeight);
            resolve();
        };
        carta.img.onerror = () => {
            console.error(`Error al cargar la imagen: ${carta.img.src}`);
            resolve();
        };
        carta.img.src = "imagenes/cartas/" + carta.valor.toString() + carta.palo + ".svg";
    });
}

async function repartirCartasIniciales() {
    for (let i = 0; i < numJugadores; i++) {
        await dibujarCarta(cartas[indiceCarta++], ctxJugadores[i], 10, 10);
        await dibujarCarta(cartas[indiceCarta++], ctxJugadores[i], 100, 10);
        cartasJugadores[i].push(cartas[indiceCarta - 2], cartas[indiceCarta - 1]);
    }
    await dibujarCarta(cartas[indiceCarta++], ctxCrupier, 10, 10);
    await dibujarCarta(cartas[indiceCarta++], ctxCrupier, 100, 10);
    cartasCrupier.push(cartas[indiceCarta - 2], cartas[indiceCarta - 1]);
}

async function pedirCarta() {
    if (jugadorActual < numJugadores) {
        let carta = cartas[indiceCarta++];
        cartasJugadores[jugadorActual].push(carta);
        dibujarCartasJugador(jugadorActual);

        let puntos = calcularPuntos(cartasJugadores[jugadorActual]);
        document.getElementById("info").innerHTML += `<br>Jugador ${jugadorActual + 1}: ${puntos} puntos`;
        if (puntos > 21) {
            document.getElementById("info").innerHTML += ` - Se ha pasado.`;
            siguienteJugador();
        }
    }
}

async function turnoCrupier() {
    ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);
    let spacing = canvasCrupier.width / 7; // Espacio entre cartas
    let startX = (canvasCrupier.width - (cartasCrupier.length * spacing)) / 2; // Centrar las cartas

    // Mostrar todas las cartas del crupier
    for (let i = 0; i < cartasCrupier.length; i++) {
        await dibujarCarta(cartasCrupier[i], ctxCrupier, startX + i * spacing, 20);
    }
    
    while (calcularPuntos(cartasCrupier) < 17 && cartasCrupier.length < 6) {
        let carta = cartas[indiceCarta++];
        cartasCrupier.push(carta);
        
        // Recalcular la posición inicial para mantener las cartas centradas
        startX = (canvasCrupier.width - (cartasCrupier.length * spacing)) / 2;
        
        // Redibujar todas las cartas
        ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);
        for (let i = 0; i < cartasCrupier.length; i++) {
            await dibujarCarta(cartasCrupier[i], ctxCrupier, startX + i * spacing, 20);
        }
    }
    determinarGanador();
}

function calcularPuntos(mano) {
    let puntos = 0;
    let ases = 0;
    for (let carta of mano) {
        if (carta.valor > 10) {
            puntos += 10;
        } else if (carta.valor === 1) {
            ases++;
            puntos += 11;
        } else {
            puntos += carta.valor;
        }
    }
    while (puntos > 21 && ases > 0) {
        puntos -= 10;
        ases--;
    }
    return puntos;
}

function determinarGanador() {
    console.log("Saldos antes de determinar ganador:", JSON.parse(JSON.stringify(saldos)));
    console.log("Apuestas:", JSON.parse(JSON.stringify(apuestas)));
    
    let puntosCrupier = calcularPuntos(cartasCrupier);
    let info = document.getElementById("info");
    info.innerHTML += `<br>Puntos del Crupier: ${puntosCrupier}`;

    let ganadores = [];
    let maxPuntos = 0;

    // Determinar los ganadores entre los jugadores
    for (let i = 1; i <= numJugadores; i++) {
        let puntosJugador = calcularPuntos(cartasJugadores[i-1]);
        info.innerHTML += `<br>Puntos del Jugador ${i}: ${puntosJugador}`;

        if (puntosJugador <= 21) {
            if (puntosJugador > maxPuntos) {
                maxPuntos = puntosJugador;
                ganadores = [i];
            } else if (puntosJugador === maxPuntos) {
                ganadores.push(i);
            }
        }
    }

    // Comparar con el crupier
    if (puntosCrupier <= 21) {
        if (puntosCrupier > maxPuntos) {
            ganadores = [0]; // Solo el crupier gana
        } else if (puntosCrupier === maxPuntos) {
            ganadores.push(0); // Empate con el crupier
        }
    }

    // Distribuir ganancias o pérdidas
    if (ganadores.length === 0 || (ganadores.includes(0) && ganadores.length === 1)) {
        // El crupier gana o todos se pasan
        info.innerHTML += `<br>${ganadores.length === 0 ? 'No hay ganadores, todos se pasan de 21' : 'El Crupier gana'}`;
        for (let i = 1; i <= numJugadores; i++) {
            saldos[0] += apuestas[i]; // El crupier gana todas las apuestas
            saldos[i] -= apuestas[i]; // Los jugadores pierden sus apuestas
        }
    } else if (ganadores.includes(0)) {
        // Empate entre el crupier y algunos jugadores
        info.innerHTML += `<br>Empate entre el Crupier y ${ganadores.length - 1} jugador(es)`;
        for (let i = 1; i <= numJugadores; i++) {
            if (!ganadores.includes(i)) {
                saldos[0] += apuestas[i]; // El crupier gana las apuestas de los perdedores
                saldos[i] -= apuestas[i]; // Los jugadores perdedores pierden sus apuestas
            }
        }
    } else {
        // Los jugadores ganan
        info.innerHTML += `<br>${ganadores.length === 1 ? 'El Jugador ' + ganadores[0] + ' gana' : 'Empate entre jugadores'}`;
        let totalGanado = apuestas[0]; // La apuesta del crupier
        for (let i = 1; i <= numJugadores; i++) {
            if (!ganadores.includes(i)) {
                totalGanado += apuestas[i]; // Suma las apuestas de los perdedores
                saldos[i] -= apuestas[i]; // Los jugadores perdedores pierden sus apuestas
            }
        }
        let gananciaPorJugador = totalGanado / ganadores.length; // Ganancia total dividida entre los ganadores
        for (let i of ganadores) {
            saldos[i] += apuestas[i] + gananciaPorJugador; // Recuperan su apuesta y ganan su parte
        }
        saldos[0] -= apuestas[0]; // El crupier pierde su apuesta
    }

    console.log("Saldos después de determinar ganador:", JSON.parse(JSON.stringify(saldos)));

    mostrarSaldosYApuestas();
    actualizarSaldos();
    document.getElementById("pedir").disabled = true;
    document.getElementById("plantar").disabled = true;
    document.getElementById("reset").style.visibility = "visible";
}

function plantarme() {
    document.getElementById("info").innerHTML += `<br>Jugador ${jugadorActual + 1} se planta.`;
    siguienteJugador();
}

function siguienteJugador() {
    jugadorActual++;
    if (jugadorActual >= numJugadores) {
        turnoCrupier();
    } else {
        document.getElementById("info").innerHTML += `<br>Turno del Jugador ${jugadorActual + 1}`;
        // Dibujamos las cartas del siguiente jugador
        dibujarCartasJugador(jugadorActual);
    }
}

function dibujarCartasJugador(jugador) {
    ctxJugadores[jugador].clearRect(0, 0, canvasJugadores[jugador].width, canvasJugadores[jugador].height);
    let spacing = canvasJugadores[jugador].width / 7;
    let startX = (canvasJugadores[jugador].width - (cartasJugadores[jugador].length * spacing)) / 2;

    for (let i = 0; i < cartasJugadores[jugador].length; i++) {
        dibujarCarta(cartasJugadores[jugador][i], ctxJugadores[jugador], startX + i * spacing, 20);
    }
}

function playagain() {
    cartasJugadores = [[], [], []];
    cartasCrupier = [];
    indiceCarta = 0;
    jugadorActual = 0;

    // Limpiar todos los canvas
    for (let ctx of ctxJugadores) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctxCrupier.clearRect(0, 0, canvasCrupier.width, canvasCrupier.height);

    // Reiniciar variables de canvas
    canvasJugadores = [];
    ctxJugadores = [];

    document.getElementById("info").innerHTML = "";
    document.getElementById("pedir").disabled = false;
    document.getElementById("plantar").disabled = false;
    document.getElementById("reset").style.visibility = "hidden";

    // Reiniciar apuestas pero mantener saldos
    apuestas = [0];
    for (let i = 1; i <= numJugadores; i++) {
        apuestas.push(0);
    }

    document.getElementById("game-container").style.display = "none";
    document.getElementById("apuestas-container").style.display = "block";
    generarCamposApuesta();
    actualizarSaldos();
    mostrarSaldosYApuestas();

    barajarCartas();
}

// Inicialización
document.getElementById("apuesta").disabled = true;
document.getElementById("botonApostar").disabled = true;

function mostrarSaldosYApuestas() {
    let infoContainer = document.getElementById("info");
    let saldosHTML = "<h3>Saldos y Apuestas</h3>";
    saldosHTML += `<p>Crupier - Saldo: $${saldos[0]}, Apuesta: $${apuestas[0]}</p>`;
    for (let i = 1; i <= numJugadores; i++) {
        saldosHTML += `<p>Jugador ${i} - Saldo: $${saldos[i]}, Apuesta: $${apuestas[i]}</p>`;
    }
    infoContainer.innerHTML = saldosHTML + infoContainer.innerHTML;
}

