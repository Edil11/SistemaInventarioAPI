async function registrarMovimiento() {
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
                    tipo_movimiento: 'entrada',
                    cantidad: 10,
                    observaciones: 'Prueba de entrada de harina'
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al registrar movimiento:', error.message);
    }
}

registrarMovimiento();