async function agregarDetallePedido() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/detalle-pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pedido_id: 3,
                receta_id: 3,
                nombre_pastel: 'Pastel de vainilla',
                version_receta: 1,
                libras: 1,
                precio_por_libra: 150
            })
        });

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);
    } catch (error) {
        console.error('Error al agregar el detalle:', error.message);
    }
}

agregarDetallePedido();