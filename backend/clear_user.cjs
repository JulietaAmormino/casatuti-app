const db = require('./db');

async function clearUserData() {
  const email = 'julietamormino1@gmail.com';
  console.log(`Buscando usuario con email: ${email}`);

  try {
    const userRes = await db.query('SELECT id_usuarios FROM public.t_usuarios WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      console.log('Usuario no encontrado.');
      process.exit(1);
    }

    const userId = userRes.rows[0].id_usuarios;
    console.log(`Usuario encontrado con ID: ${userId}`);

    // Borrar clases
    const delClases = await db.query('DELETE FROM public.t_inscripciones_clase WHERE id_usuarios = $1', [userId]);
    console.log(`Se borraron ${delClases.rowCount} inscripciones a clases.`);

    // Borrar arcilla y deudas (t_deudas_insumos)
    const delDeudas = await db.query('DELETE FROM public.t_deudas_insumos WHERE id_usuarios = $1', [userId]);
    console.log(`Se borraron ${delDeudas.rowCount} registros de arcilla y deudas.`);

    // Resetear creditos (t_cuenta_alumno)
    const updCuenta = await db.query('UPDATE public.t_cuenta_alumno SET saldo_actual = 0 WHERE id_usuarios = $1', [userId]);
    console.log(`Se actualizaron ${updCuenta.rowCount} cuentas de alumno a 0 créditos.`);

    console.log('Operación completada con éxito.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

clearUserData();
