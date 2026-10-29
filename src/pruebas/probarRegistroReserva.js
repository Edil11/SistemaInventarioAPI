async function probarRegistroReserva() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/reservas-inventario',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    detalle_pedido_id: 2,
                    materia_prima_id: 1,
                    cantidad: 2
                })
            }
        );

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);
    } catch (error) {
        console.error('Error al probar la reserva:', error.message);
    }
}

probarRegistroReserva();