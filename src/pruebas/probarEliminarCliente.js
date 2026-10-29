async function eliminarCliente() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/clientes/2',
            {
                method: 'DELETE'
            }
        );

        const datos = await respuesta.text();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

eliminarCliente();