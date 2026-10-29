async function probarEliminarReceta() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/recetas/999999',
            {
                method: 'DELETE'
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al probar eliminación:', error.message);
    }
}

probarEliminarReceta();