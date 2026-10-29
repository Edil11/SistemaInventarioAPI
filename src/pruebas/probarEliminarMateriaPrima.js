async function probarEliminarMateriaPrima() {
    try {
        const registro = await fetch(
            'http://localhost:3000/api/materias-primas',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Ingrediente temporal 2',
                    unidad_base: 'kg',
                    stock_actual: 1,
                    stock_minimo: 0,
                    costo_unitario: 1
                })
            }
        );

        const materia = await registro.json();

        if (!registro.ok) {
            console.log('No se pudo crear el ingrediente temporal:', materia);
            return;
        }

        console.log('Materia prima temporal creada con ID:', materia.id);

        const respuesta = await fetch(
            `http://localhost:3000/api/materias-primas/${materia.id}`,
            {
                method: 'DELETE'
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error en la prueba:', error.message);
    }
}

probarEliminarMateriaPrima();