const express = require('express');
const router = express.Router();
const pool = require('../database');

router.get('/', async (req, res) => {
    try {
        const [recetas] = await pool.query(`
            SELECT *
            FROM recetas
            ORDER BY id DESC
        `);

        res.json(recetas);
    } catch (error) {
        console.error('Error al consultar recetas:', error.message);

        res.status(500).json({
            error: 'Error al consultar las recetas'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [recetas] = await pool.query(
            'SELECT * FROM recetas WHERE id = ?',
            [id]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'Receta no encontrada'
            });
        }

        res.json(recetas[0]);
    } catch (error) {
        console.error('Error al consultar receta:', error.message);

        res.status(500).json({
            error: 'Error al consultar la receta'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El nombre de la receta es obligatorio'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO recetas (nombre, descripcion)
             VALUES (?, ?)`,
            [
                nombre.trim(),
                descripcion || null
            ]
        );

        res.status(201).json({
            mensaje: 'Receta registrada correctamente',
            id: resultado.insertId,
            nombre: nombre.trim()
        });
    } catch (error) {
        console.error('Error al registrar receta:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una receta con ese nombre y versión'
            });
        }

        res.status(500).json({
            error: 'Error al registrar la receta'
        });
    }
});


router.get('/:id/ingredientes', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [recetas] = await pool.query(
            'SELECT id, nombre FROM recetas WHERE id = ?',
            [id]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'Receta no encontrada'
            });
        }

        const [ingredientes] = await pool.query(
            `SELECT
                dr.id,
                dr.receta_id,
                dr.materia_prima_id,
                mp.nombre AS ingrediente,
                dr.cantidad_por_libra
             FROM detalle_receta dr
             INNER JOIN materias_primas mp
                ON mp.id = dr.materia_prima_id
             WHERE dr.receta_id = ?
             ORDER BY mp.nombre`,
            [id]
        );

        res.json({
            receta: recetas[0].nombre,
            ingredientes
        });
    } catch (error) {
        console.error(
            'Error al consultar ingredientes:',
            error.message
        );

        res.status(500).json({
            error: 'Error al consultar los ingredientes de la receta'
        });
    }
});


router.post('/:id/ingredientes', async (req, res) => {
    try {
        const { id } = req.params;
        const { materia_prima_id, cantidad_por_libra } = req.body;

        if (!/^\d+$/.test(id) || Number(id) <= 0) {
            return res.status(400).json({
                error: 'El ID de la receta debe ser válido'
            });
        }

        if (
            !Number.isInteger(Number(materia_prima_id)) ||
            Number(materia_prima_id) <= 0 ||
            cantidad_por_libra === undefined ||
            cantidad_por_libra === null ||
            cantidad_por_libra === '' ||
            !Number.isFinite(Number(cantidad_por_libra)) ||
            Number(cantidad_por_libra) <= 0
        ) {
            return res.status(400).json({
                error: 'Debes indicar un ID de materia prima y una cantidad válida'
            });
        }

        const [recetas] = await pool.query(
            'SELECT id FROM recetas WHERE id = ?',
            [id]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'Receta no encontrada'
            });
        }

        const [materias] = await pool.query(
            'SELECT id FROM materias_primas WHERE id = ?',
            [materia_prima_id]
        );

        if (materias.length === 0) {
            return res.status(404).json({
                error: 'Materia prima no encontrada'
            });
        }

        const [existente] = await pool.query(
            `SELECT id
             FROM detalle_receta
             WHERE receta_id = ?
               AND materia_prima_id = ?`,
            [id, materia_prima_id]
        );

        if (existente.length > 0) {
            await pool.query(
                `UPDATE detalle_receta
                 SET cantidad_por_libra = ?
                 WHERE id = ?`,
                [
                    Number(cantidad_por_libra),
                    existente[0].id
                ]
            );

            return res.json({
                mensaje: 'La cantidad del ingrediente se actualizó correctamente',
                receta_id: Number(id),
                materia_prima_id: Number(materia_prima_id),
                cantidad_por_libra: Number(cantidad_por_libra)
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO detalle_receta
                (receta_id, materia_prima_id, cantidad_por_libra)
             VALUES (?, ?, ?)`,
            [
                id,
                materia_prima_id,
                Number(cantidad_por_libra)
            ]
        );

        res.status(201).json({
            mensaje: 'Ingrediente agregado correctamente a la receta',
            id: resultado.insertId,
            receta_id: Number(id),
            materia_prima_id: Number(materia_prima_id),
            cantidad_por_libra: Number(cantidad_por_libra)
        });
    } catch (error) {
        console.error(
            'Error al agregar ingrediente:',
            error.message
        );

        res.status(500).json({
            error: 'Error al agregar o actualizar el ingrediente de la receta'
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        if (!/^\d+$/.test(id) || Number(id) <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El nombre de la receta es obligatorio'
            });
        }

        const [recetas] = await pool.query(
            'SELECT id FROM recetas WHERE id = ?',
            [id]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'Receta no encontrada'
            });
        }

        await pool.query(
            `UPDATE recetas
             SET nombre = ?, descripcion = ?
             WHERE id = ?`,
            [
                nombre.trim(),
                descripcion || null,
                id
            ]
        );

        res.json({
            mensaje: 'Receta actualizada correctamente',
            id: Number(id),
            nombre: nombre.trim(),
            descripcion: descripcion || null
        });
    } catch (error) {
        console.error('Error al actualizar receta:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una receta con ese nombre y versión'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar la receta'
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id) || Number(id) <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número válido'
            });
        }

        const [recetas] = await pool.query(
            'SELECT id FROM recetas WHERE id = ?',
            [id]
        );

        if (recetas.length === 0) {
            return res.status(404).json({
                error: 'Receta no encontrada'
            });
        }

        await pool.query(
            'DELETE FROM recetas WHERE id = ?',
            [id]
        );

        res.json({
            mensaje: 'Receta eliminada correctamente',
            id: Number(id)
        });
    } catch (error) {
        console.error('Error al eliminar receta:', error.message);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                error: 'No se puede eliminar esta receta porque tiene registros relacionados'
            });
        }

        res.status(500).json({
            error: 'Error al eliminar la receta'
        });
    }
});

module.exports = router;