async function registrarSalida() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/movimientos-inventario',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    materia_prima_id: 1,
                    tipo_movimiento: 'consumo',
                    cantidad: 5,
                    observaciones: 'Prueba de salida de harina'
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', resultado);

    } catch (error) {
        console.error('Error al registrar la salida:', error.message);
    }
}

registrarSalida();