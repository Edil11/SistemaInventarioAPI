async function registrarMateriaPrima() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/materias-primas',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: 'azucar',
                    unidad_base: 'kg',
                    stock_actual: 10,
                    stock_minimo: 2,
                    costo_unitario: 25
                })
            }
        );

        const resultado = await respuesta.json();

        console.log('Código de respuesta:', respuesta.status);
        console.log(resultado);

    } catch (error) {
        console.error('Error al registrar:', error.message);
    }
}

registrarMateriaPrima();