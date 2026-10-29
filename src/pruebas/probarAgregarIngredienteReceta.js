async function probarAgregarIngrediente() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/recetas/1/ingredientes',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    materia_prima_id: 1,
                    cantidad_por_libra: 0.5
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al agregar ingrediente:', error.message);
    }
}

probarAgregarIngrediente();