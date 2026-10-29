async function actualizarMateriaPrima() {
    try {
        const respuesta = await fetch(
            'http://localhost:3000/api/materias-primas/13',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'Azúcar blanca prueba',
                    unidad_base: 'kg',
                    stock_actual: 15,
                    stock_minimo: 3,
                    costo_unitario: 28
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al actualizar:', error.message);
    }
}

actualizarMateriaPrima();