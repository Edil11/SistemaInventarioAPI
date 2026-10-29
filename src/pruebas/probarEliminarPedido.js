async function eliminarPedido() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/pedidos/3',
            {
                method: 'DELETE'
            }
        );

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error al eliminar el pedido:', error.message);
    }
}

eliminarPedido();