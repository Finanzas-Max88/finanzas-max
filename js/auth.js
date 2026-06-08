const PIN_KEY = "finanzasmax_pin";

function pinExiste() {
    return localStorage.getItem(PIN_KEY);
}

function guardarPin(pin) {
    localStorage.setItem(PIN_KEY, pin);
}

function validarPin(pin) {
    return localStorage.getItem(PIN_KEY) === pin;
}