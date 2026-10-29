const pool = require('./database');

async function probarConexion() {
    try {
        const conexion = await pool.getConnection();

        console.log('¡Conexión exitosa con MySQL!');
        
        const [resultado] = await conexion.query(
            'SELECT DATABASE() AS base_datos'
        );

        console.log('Base de datos conectada:', resultado[0].base_datos);

        conexion.release();
    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();