async function actualizarCliente() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/clientes/2',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Cliente actualizado',
                    telefono: '77777777',
                    observaciones: 'Datos modificados correctamente'
                })
            }
        );

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

actualizarCliente();