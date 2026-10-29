async function actualizarPedido() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/pedidos/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estado: 'confirmado',
                fecha_entrega: '2026-11-02 15:00:00',
                observaciones: 'Pedido confirmado para la prueba'
            })
        });

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error al actualizar el pedido:', error.message);
    }
}

actualizarPedido();