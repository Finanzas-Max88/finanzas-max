console.log("DATABASE.JS CARGADO");
const DB_NAME = "FinanzasMaxDB";
const DB_VERSION = 2;

let db;

function abrirDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onerror = () => {
            reject("Error al abrir la base de datos");
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {

    const database = event.target.result;

    if (!database.objectStoreNames.contains("presupuestos")) {
        database.createObjectStore(
            "presupuestos",
            {
                keyPath: "categoria"
            }
        );
    }

    if (!database.objectStoreNames.contains("cuentas")) {

        const cuentasStore =
            database.createObjectStore(
                "cuentas",
                {
                    keyPath: "id",
                    autoIncrement: true
                }
            );

        cuentasStore.createIndex(
            "nombre",
            "nombre",
            { unique: false }
        );
    }

    if (!database.objectStoreNames.contains("movimientos")) {

        database.createObjectStore(
            "movimientos",
            {
                keyPath: "id",
                autoIncrement: true
            }
        );
    }
};

async function inicializarCuentas() {

    const cuentas = await obtenerCuentas();

    if (cuentas.length > 0) return;

    const cuentasIniciales = [
        {
            nombre: "Santander Caja de Ahorro ARS",
            moneda: "ARS",
            saldo: 0
        },
        {
            nombre: "Santander Caja de Ahorro USD",
            moneda: "USD",
            saldo: 0
        },
        {
            nombre: "Mercado Pago",
            moneda: "ARS",
            saldo: 0
        },
        {
            nombre: "Efectivo",
            moneda: "ARS",
            saldo: 0
        },
        {
            nombre: "Visa Santander",
            moneda: "ARS",
            saldo: 0
        }
    ];

    const tx = db.transaction(
        "cuentas",
        "readwrite"
    );

    const store = tx.objectStore(
        "cuentas"
    );

    cuentasIniciales.forEach(cuenta => {
        store.add(cuenta);
    });
}

function obtenerCuentas() {

    return new Promise((resolve) => {

        const tx = db.transaction(
            "cuentas",
            "readonly"
        );

        const store = tx.objectStore(
            "cuentas"
        );

        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}
function guardarMovimiento(movimiento) {

    return new Promise((resolve, reject) => {

        const tx = db.transaction(
            ["movimientos", "cuentas"],
            "readwrite"
        );

        const movimientosStore =
            tx.objectStore("movimientos");

        const cuentasStore =
            tx.objectStore("cuentas");

        movimientosStore.add(movimiento);

        const cuentaRequest =
            cuentasStore.get(
                Number(movimiento.cuentaId)
            );

        cuentaRequest.onsuccess = () => {

            const cuenta =
                cuentaRequest.result;

            if (
                movimiento.tipo === "ingreso"
            ) {
                cuenta.saldo +=
                    movimiento.importe;
            } else {
                cuenta.saldo -=
                    movimiento.importe;
            }

            cuentasStore.put(cuenta);

        };

        tx.oncomplete = () => {
            resolve();
        };

        tx.onerror = () => {
            reject();
        };

    });

}
function obtenerMovimientos() {

    return new Promise((resolve) => {

        const tx = db.transaction(
            "movimientos",
            "readonly"
        );

        const store =
            tx.objectStore(
                "movimientos"
            );

        const request =
            store.getAll();

        request.onsuccess = () => {

            resolve(
                request.result
            );

        };

    });

}
async function exportarDatos() {

    const cuentas =
        await obtenerCuentas();

    const movimientos =
        await obtenerMovimientos();

    return {

        fechaBackup:
            new Date()
                .toISOString(),

        cuentas,

        movimientos

    };

}
async function importarDatos(datos) {

    // CUENTAS

    const cuentasActuales =
        await obtenerCuentas();

    let tx =
        db.transaction(
            "cuentas",
            "readwrite"
        );

    let store =
        tx.objectStore(
            "cuentas"
        );

    cuentasActuales.forEach(
        cuenta => {
            store.delete(
                cuenta.id
            );
        }
    );

    await new Promise(
        resolve => {
            tx.oncomplete =
                resolve;
        }
    );

    tx =
        db.transaction(
            "cuentas",
            "readwrite"
        );

    store =
        tx.objectStore(
            "cuentas"
        );

    datos.cuentas.forEach(
        cuenta => {
            store.put(
                cuenta
            );
        }
    );

    await new Promise(
        resolve => {
            tx.oncomplete =
                resolve;
        }
    );

    // MOVIMIENTOS

    const movimientosActuales =
        await obtenerMovimientos();

    tx =
        db.transaction(
            "movimientos",
            "readwrite"
        );

    store =
        tx.objectStore(
            "movimientos"
        );

    movimientosActuales.forEach(
        movimiento => {
            store.delete(
                movimiento.id
            );
        }
    );

    await new Promise(
        resolve => {
            tx.oncomplete =
                resolve;
        }
    );

    tx =
        db.transaction(
            "movimientos",
            "readwrite"
        );

    store =
        tx.objectStore(
            "movimientos"
        );

    datos.movimientos.forEach(
        movimiento => {
            store.put(
                movimiento
            );
        }
    );

    await new Promise(
        resolve => {
            tx.oncomplete =
                resolve;
        }
    );

}
function guardarPresupuesto(
    presupuesto
) {

    return new Promise(
        (resolve) => {

            const tx =
                db.transaction(
                    "presupuestos",
                    "readwrite"
                );

            tx.objectStore(
                "presupuestos"
            ).put(
                presupuesto
            );

            tx.oncomplete =
                () => resolve();

        }
    );

}

function obtenerPresupuestos() {

    return new Promise(
        (resolve) => {

            const tx =
                db.transaction(
                    "presupuestos",
                    "readonly"
                );

            const request =
                tx.objectStore(
                    "presupuestos"
                ).getAll();

            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );

        }
    );

}
