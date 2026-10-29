async function registrarCliente() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: 'Cliente de prueba',
                telefono: '88888888',
                observaciones: 'Registro de prueba'
            })
        });

        const datos = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log('Resultado:', datos);

    } catch (error) {
        console.error('Error al registrar el cliente:', error.message);
    }
}

registrarCliente();