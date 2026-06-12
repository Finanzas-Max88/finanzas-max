let graficoCategorias = null;
const btnGuardarPresupuesto =
    document.getElementById(
        "btnGuardarPresupuesto"
    );
const btnGuardarMovimiento =
    document.getElementById(
        "btnGuardarMovimiento"
    );
    const btnVoz =
    document.getElementById(
        "btnVoz"
    );

const textoReconocido =
    document.getElementById(
        "textoReconocido"
    );

    const btnExportar =
    document.getElementById(
        "btnExportar"
    );

const inputImportar =
    document.getElementById(
        "inputImportar"
    );

const pinInput =
    document.getElementById("pinInput");

const pinButton =
    document.getElementById("pinButton");

const pinScreen =
    document.getElementById("pin-screen");

const dashboard =
    document.getElementById("dashboard");

pinButton.addEventListener(
    "click",
    async () => {
        btnGuardarMovimiento.addEventListener(
    "click",
    async () => {

        const tipo =
            document.getElementById(
                "tipoMovimiento"
            ).value;

        const cuentaId =
            document.getElementById(
                "cuentaMovimiento"
            ).value;

        const importe =
            Number(
                document.getElementById(
                    "importeMovimiento"
                ).value
            );

        const descripcion =
            document.getElementById(
                "descripcionMovimiento"
            ).value;

        if (
            !importe ||
            importe <= 0
        ) {

            alert(
                "Ingresá un importe válido"
            );

            return;
        }

        const selectorCuenta =
    document.getElementById(
        "cuentaMovimiento"
    );

const cuentaNombre =
    selectorCuenta.options[
        selectorCuenta.selectedIndex
    ].text;

const categoria =
    detectarCategoria(
        descripcion
    );

await guardarMovimiento({
    tipo,
    cuentaId,
    cuentaNombre,
    importe,
    descripcion,
    categoria,
    fecha:
        new Date()
            .toISOString()
});

        document.getElementById(
            "importeMovimiento"
        ).value = "";

        document.getElementById(
            "descripcionMovimiento"
        ).value = "";

        await cargarDashboard();

        await cargarMovimientos();

        await cargarResumenCategorias();

        await cargarResumenMensual();

        await cargarConsejosAhorro();

        await cargarGraficoCategorias();

        await cargarPresupuestos();

        alert(
            "Movimiento guardado"
        );

    }
);
        

        const pin = pinInput.value;

        if (pin.length !== 6) {

            alert(
                "El PIN debe tener 6 dígitos"
            );

            return;
        }

        if (!pinExiste()) {

            guardarPin(pin);

            await iniciarSistema();

            mostrarDashboard();

            return;
        }

        if (validarPin(pin)) {

            await iniciarSistema();

            mostrarDashboard();

        } else {

            alert("PIN incorrecto");

        }
    }
);

async function iniciarSistema() {

    await abrirDB();

    await inicializarCuentas();

    await cargarDashboard();

    await cargarSelectorCuentas();

    await cargarMovimientos();

    await cargarResumenCategorias();

    await cargarResumenMensual();

    await cargarConsejosAhorro();

    await cargarGraficoCategorias();

    await cargarPresupuestos();

}

async function cargarDashboard() {
    




    const cuentas =
        await obtenerCuentas();

    let ars = 0;
    let usd = 0;

    cuentas.forEach(cuenta => {

        if (
            cuenta.moneda === "ARS"
        ) {
            ars += cuenta.saldo;
        }

        if (
            cuenta.moneda === "USD"
        ) {
            usd += cuenta.saldo;
        }

    });

    document.getElementById(
        "saldoARS"
    ).textContent =
        "$" +
        ars.toLocaleString(
            "es-AR"
        );

    document.getElementById(
        "saldoUSD"
    ).textContent =
        "USD " +
        usd.toLocaleString(
            "es-AR"
        );

    document.getElementById(
        "saldoTotal"
    ).textContent =
        "$" +
        ars.toLocaleString(
            "es-AR"
        );
}

function mostrarDashboard() {

    pinScreen.classList.add(
        "hidden"
    );

    dashboard.classList.remove(
        "hidden"
    );
}
async function cargarSelectorCuentas() {

    const cuentas =
        await obtenerCuentas();

    const selector =
        document.getElementById(
            "cuentaMovimiento"
        );

    selector.innerHTML = "";

    cuentas.forEach(cuenta => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            cuenta.id;

        option.textContent =
            cuenta.nombre;

        selector.appendChild(
            option
        );

    });

}
async function cargarMovimientos() {

    const movimientos =
        await obtenerMovimientos();

    const lista =
        document.getElementById(
            "movimientos"
        );

    lista.innerHTML = "";

    movimientos
        .reverse()
        .forEach(movimiento => {

            const li =
                document.createElement("li");

            const fecha =
                new Date(
                    movimiento.fecha
                ).toLocaleString(
                    "es-AR"
                );

            const signo =
                movimiento.tipo === "ingreso"
                    ? "+"
                    : "-";

            const icono =
                movimiento.tipo === "ingreso"
                    ? "🟢"
                    : "🔴";

            li.innerHTML = `
                <strong>
                    ${icono}
                    ${movimiento.descripcion}
                </strong>
                <br>

                ${movimiento.cuentaNombre || "Cuenta"}

                <br>
                <br>
             📂 ${movimiento.categoria || "Otros"}

                <small>
                    ${fecha}
                </small>

                <br>

                <strong>
                    ${signo}$${movimiento.importe.toLocaleString("es-AR")}
                </strong>
            `;

            lista.appendChild(li);

        });

}
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();

    recognition.lang = "es-AR";

    recognition.interimResults =
        false;

    recognition.continuous =
        false;

    btnVoz.addEventListener(
        "click",
        () => {

            textoReconocido.textContent =
                "🎤 Escuchando...";

            recognition.start();

        }
    );

  recognition.onresult =
    (event) => {

        console.log(
            "RESULTADO COMPLETO:",
            event
        );

        const texto =
            event.results[0][0]
            .transcript;

        console.log(
            "TEXTO:",
            texto
        );

        textoReconocido.textContent =
            texto;

    };

   recognition.onstart = () => {

    console.log("Micrófono iniciado");

};

recognition.onend = () => {

    console.log("Micrófono finalizado");

    textoReconocido.textContent +=
        " (finalizado)";

};

recognition.onerror = (event) => {

    console.error(
        "Error reconocimiento:",
        event.error
    );

    textoReconocido.textContent =
        "Error: " + event.error;

};

} else {

    btnVoz.style.display =
        "none";

}
function detectarCategoria(
    descripcion
) {

    const texto =
        descripcion
            .toLowerCase();

    if (
        texto.includes("carrefour") ||
        texto.includes("coto") ||
        texto.includes("carniceria") ||
        texto.includes("verduleria") ||
        texto.includes("la gallega")
    ) {
        return "Alimentos";
    }

    if (
        texto.includes("ypf") ||
        texto.includes("shell")
    ) {
        return "Combustible";
    }

    if (
        texto.includes("personal") ||
        texto.includes("epe") ||
        texto.includes("litoral gas") ||
        texto.includes("aguas")
    ) {
        return "Servicios";
    }

    if (
        texto.includes("spotify") ||
        texto.includes("apple") ||
        texto.includes("google")
    ) {
        return "Suscripciones";
    }

    if (
        texto.includes("alquiler")
    ) {
        return "Vivienda";
    }

    return "Otros";
}
async function cargarResumenCategorias() {

    const movimientos =
        await obtenerMovimientos();

    const resumen = {};

    movimientos.forEach(
        movimiento => {

            if (
                movimiento.tipo !== "gasto"
            ) {
                return;
            }

            const categoria =
                movimiento.categoria ||
                "Otros";

            if (
                !resumen[categoria]
            ) {
                resumen[categoria] = 0;
            }

            resumen[categoria] +=
                movimiento.importe;

        }
    );

    const contenedor =
        document.getElementById(
            "resumenCategorias"
        );

    contenedor.innerHTML = "";

    Object.entries(
        resumen
    ).forEach(
        ([categoria, total]) => {

            const fila =
                document.createElement(
                    "div"
                );

            fila.innerHTML = `
                <strong>
                    ${categoria}
                </strong>

                <span style="float:right">
                    $${total.toLocaleString("es-AR")}
                </span>
            `;

            fila.style.marginBottom =
                "10px";

            contenedor.appendChild(
                fila
            );

        }
    );

}
async function cargarResumenMensual() {

    const movimientos =
        await obtenerMovimientos();

    const hoy = new Date();

    const mesActual =
        hoy.getMonth();

    const anioActual =
        hoy.getFullYear();

    let ingresos = 0;
    let gastos = 0;

    movimientos.forEach(
        movimiento => {

            const fecha =
                new Date(
                    movimiento.fecha
                );

            if (
                fecha.getMonth() !== mesActual ||
                fecha.getFullYear() !== anioActual
            ) {
                return;
            }

            if (
                movimiento.tipo ===
                "ingreso"
            ) {

                ingresos +=
                    movimiento.importe;

            } else {

                gastos +=
                    movimiento.importe;

            }

        }
    );

    const ahorro =
        ingresos - gastos;

    const tasaAhorro =
        ingresos > 0
            ? Math.round(
                (ahorro / ingresos) *
                100
            )
            : 0;

    document.getElementById(
        "resumenMensual"
    ).innerHTML = `

        <p>
            💰 Ingresos:
            <strong>
                $${ingresos.toLocaleString("es-AR")}
            </strong>
        </p>

        <p>
            💸 Gastos:
            <strong>
                $${gastos.toLocaleString("es-AR")}
            </strong>
        </p>

        <p>
            🏦 Ahorro:
            <strong>
                $${ahorro.toLocaleString("es-AR")}
            </strong>
        </p>

        <p>
            📈 Tasa de ahorro:
            <strong>
                ${tasaAhorro}%
            </strong>
        </p>

    `;
}
async function cargarConsejosAhorro() {

    const movimientos =
        await obtenerMovimientos();

    const consejos = [];

    let ingresos = 0;
    let gastos = 0;

    const categorias = {};

    let gastoMayor = null;

    movimientos.forEach(
        movimiento => {

            if (
                movimiento.tipo ===
                "ingreso"
            ) {

                ingresos +=
                    movimiento.importe;

            } else {

                gastos +=
                    movimiento.importe;

                const categoria =
                    movimiento.categoria ||
                    "Otros";

                if (
                    !categorias[categoria]
                ) {
                    categorias[categoria] = 0;
                }

                categorias[categoria] +=
                    movimiento.importe;

                if (
                    !gastoMayor ||
                    movimiento.importe >
                    gastoMayor.importe
                ) {

                    gastoMayor =
                        movimiento;

                }
            }
        }
    );

    const categoriaPrincipal =
        Object.entries(
            categorias
        ).sort(
            (a, b) =>
                b[1] - a[1]
        )[0];

    if (
        categoriaPrincipal
    ) {

        const porcentaje =
            Math.round(
                (
                    categoriaPrincipal[1] /
                    gastos
                ) * 100
            );

        consejos.push(
            `📂 ${categoriaPrincipal[0]} representa ${porcentaje}% de tus gastos.`
        );

    }

    const tasaAhorro =
        ingresos > 0
            ? Math.round(
                (
                    (ingresos - gastos) /
                    ingresos
                ) * 100
            )
            : 0;

    consejos.push(
        `📈 Tu tasa de ahorro actual es ${tasaAhorro}%.`
    );

    if (
        gastoMayor
    ) {

        consejos.push(
            `💸 Tu gasto más alto fue "${gastoMayor.descripcion}" por $${gastoMayor.importe.toLocaleString("es-AR")}.`
        );

    }

    if (
        tasaAhorro >= 30
    ) {

        consejos.push(
            "✅ Excelente nivel de ahorro."
        );

    } else {

        consejos.push(
            "⚠️ Intentá aumentar tu tasa de ahorro."
        );

    }

    const contenedor =
        document.getElementById(
            "consejosAhorro"
        );

    contenedor.innerHTML =
        consejos
            .map(
                consejo =>
                    `<p>${consejo}</p>`
            )
            .join("");

}
async function cargarGraficoCategorias() {

    const movimientos =
        await obtenerMovimientos();

    const resumen = {};

    movimientos.forEach(
        movimiento => {

            if (
                movimiento.tipo !== "gasto"
            ) {
                return;
            }

            const categoria =
                movimiento.categoria ||
                "Otros";

            if (
                !resumen[categoria]
            ) {

                resumen[categoria] = 0;

            }

            resumen[categoria] +=
                movimiento.importe;

        }
    );

    const labels =
        Object.keys(resumen);

    const valores =
        Object.values(resumen);

    const ctx =
        document
            .getElementById(
                "graficoCategorias"
            )
            .getContext("2d");

    if (
        graficoCategorias
    ) {

        graficoCategorias.destroy();

    }

    graficoCategorias =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels,

                datasets: [
                    {
                        data: valores
                    }
                ]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        position:
                            "bottom"

                    }

                }

            }

        });

}
btnExportar.addEventListener(
    "click",
    async () => {

        const datos =
            await exportarDatos();

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        datos,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            `FinanzasMax_Backup_${new Date().toISOString().slice(0,10)}.json`;

        a.click();

    }
);
btnGuardarPresupuesto.addEventListener(
    "click",
    async () => {

        const categoria =
            document.getElementById(
                "categoriaPresupuesto"
            ).value;

        const importe =
            Number(
                document.getElementById(
                    "importePresupuesto"
                ).value
            );

        if (
            !importe ||
            importe <= 0
        ) {

            alert(
                "Ingresá un importe válido"
            );

            return;
        }

        await guardarPresupuesto({
            categoria,
            importe
        });

        document.getElementById(
            "importePresupuesto"
        ).value = "";

        await cargarPresupuestos();

        alert(
            "Presupuesto guardado"
        );

    }
);
async function cargarPresupuestos() {

    const presupuestos =
        await obtenerPresupuestos();

    const movimientos =
        await obtenerMovimientos();

    const contenedor =
        document.getElementById(
            "presupuestosLista"
        );

    if (!contenedor) return;

    contenedor.innerHTML = "";

    presupuestos.forEach(
        presupuesto => {

            let gastado = 0;

            movimientos.forEach(
                movimiento => {

                    if (
                        movimiento.tipo === "gasto" &&
                        movimiento.categoria === presupuesto.categoria
                    ) {
                        gastado += movimiento.importe;
                    }

                }
            );

            const porcentaje =
                Math.min(
                    100,
                    Math.round(
                        (gastado /
                            presupuesto.importe) *
                        100
                    )
                );

            const tarjeta =
                document.createElement(
                    "div"
                );

            tarjeta.style.marginBottom =
                "15px";

            const diferencia =
    presupuesto.importe - gastado;

tarjeta.innerHTML = `
    <strong>
        ${presupuesto.categoria}
    </strong>

    <br>

    Gastado:
    $${gastado.toLocaleString("es-AR")}

    <br>

    Presupuesto:
    $${presupuesto.importe.toLocaleString("es-AR")}

    <br>

    ${
        diferencia >= 0
            ? `Disponible: $${diferencia.toLocaleString("es-AR")}`
            : `Excedido: $${Math.abs(diferencia).toLocaleString("es-AR")}`
    }

    <br><br>

    <progress
        value="${porcentaje}"
        max="100"
        style="width:100%">
    </progress>

    <br>

    ${porcentaje}%
`;

            contenedor.appendChild(
                tarjeta
            );

        }
    );

}

inputImportar.addEventListener(
    "change",
    async (event) => {

        const archivo =
            event.target.files[0];

        if (!archivo) return;

        const texto =
            await archivo.text();

        const datos =
            JSON.parse(texto);

        await importarDatos(
            datos
        );

        await cargarDashboard();
        await cargarMovimientos();
        await cargarResumenCategorias();
        await cargarResumenMensual();
        await cargarConsejosAhorro();
        await cargarGraficoCategorias();
        await cargarPresupuestos();

        alert(
            "Backup restaurado correctamente"
        );

    }
);