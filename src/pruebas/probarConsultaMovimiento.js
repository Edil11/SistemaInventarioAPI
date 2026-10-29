async function consultarMovimientos() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/movimientos-inventario'
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Movimientos registrados:', resultado);

    } catch (error) {
        console.error('Error al consultar movimientos:', error.message);
    }
}

consultarMovimientos();