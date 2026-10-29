async function registrarReceta() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/recetas',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Pastel de vainilla',
                    descripcion: 'Receta de prueba de pastel de vainilla para el sistema de repostería'
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al registrar receta:', error.message);
    }
}

registrarReceta();