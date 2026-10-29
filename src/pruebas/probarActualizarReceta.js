async function probarActualizarReceta() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/recetas/1',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Pastel de chocolate',
                    descripcion: 'Receta actualizada para el sistema de repostería'
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al actualizar receta:', error.message);
    }
}

probarActualizarReceta();