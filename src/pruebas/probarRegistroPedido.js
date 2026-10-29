async function registrarPedido() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/pedidos',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cliente_id: 3,
                    fecha_entrega: '2026-11-01 15:00:00',
                    observaciones: 'Pedido de prueba'
                })
            }
        );

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error al registrar el pedido:', error.message);
    }
}

registrarPedido();