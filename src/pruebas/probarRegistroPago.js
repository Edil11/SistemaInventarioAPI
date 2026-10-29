async function registrarPago() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/pagos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pedido_id: 999999,
                monto: 100,
                metodo_pago: 'efectivo',
                referencia: null,
                observaciones: 'Pago de prueba'
            })
        });

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);
    } catch (error) {
        console.error('Error al registrar el pago:', error.message);
    }
}

registrarPago();