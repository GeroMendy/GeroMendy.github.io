
let pencil_canvas = document.querySelector("#js-canvas");
let pencil_ctx = pencil_canvas.getContext("2d");


// let canvas_width, cx;
// let canvas_height, cy;

const DEFAULT_PENCIL_COLOR = "#000000";
const DEFAULT_PENCIL_WIDTH = 1;
const DEFAULT_WIDTH = pencil_canvas.clientWidth;
const DEFAULT_HEIGHT = pencil_canvas.clientHeight;

let modoLapiz = false;
let estaDibujando = false;
let pencil_color = DEFAULT_PENCIL_COLOR;
let pencil_width = DEFAULT_PENCIL_WIDTH;
let puntos = [];

pencil_ctx.lineJoin = "round";

pencil_canvas.addEventListener('mousedown', function () {
    if (modoLapiz) {
        estaDibujando = true;
        puntos.length = 0;
        pencil_ctx.strokeStyle = pencil_color;
        pencil_ctx.lineWidth = pencil_width;
        pencil_ctx.beginPath();
    }
});

pencil_canvas.addEventListener('mouseup', function () {
    if (modoLapiz) {
        estaDibujando = false;
    }
});

pencil_canvas.addEventListener("mouseout", function () {
    if (modoLapiz) {
        estaDibujando = false;
    }
});

pencil_canvas.addEventListener("mousemove", function (e) {
    if (modoLapiz && estaDibujando) {
        let m = oMousePos(pencil_canvas, e);
        puntos.push(m);
        pencil_ctx.lineTo(m.x, m.y);
        pencil_ctx.stroke();
    }
});




function oMousePos(canvas, evt) {
    let ClientRect = canvas.getBoundingClientRect();
    return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
    }
}
function resizePencilCanvas(new_height = DEFAULT_HEIGHT, new_width = DEFAULT_PENCIL_WIDTH) {
    pencil_canvas.height = new_height;
    pencil_canvas.width = new_width;
}

function setPencilOn() {
    modoLapiz = true;
}
function setPencilOff() {
    modoLapiz = false;
}
function cambiarColorLapiz(new_color = DEFAULT_PENCIL_COLOR) {
    pencil_color = new_color;
}
function changeWidth(new_width = DEFAULT_PENCIL_WIDTH) {
    pencil_width = new_width;
}
