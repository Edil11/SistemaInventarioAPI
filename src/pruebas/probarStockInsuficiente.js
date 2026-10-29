async function probarStockInsuficiente() {
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
                    cantidad: 9999,
                    observaciones: 'Prueba de stock insuficiente'
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', resultado);

    } catch (error) {
        console.error('Error en la prueba:', error.message);
    }
}

probarStockInsuficiente();