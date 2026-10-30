import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function run() {
  const { default: db } = await import('./backend/db.js');
  const users = await db.query(`
    SELECT u.id_usuarios, u.nombre, u.apellido, u.rol, 
      (SELECT COALESCE(string_agg(s.n_sucursal, ', '), 'CENTRO') 
       FROM unnest(u.id_sucursales) sid 
       LEFT JOIN public.t_sucursales s ON s.id_sucursal = sid) AS sucursal 
    FROM public.t_usuarios u 
    WHERE u.rol = 'ALUMNO'
  `);
  console.log('Total alumnos en t_usuarios:', users.rows.length);
  console.log('Alumnos muestra:', users.rows.slice(0, 10));

  const cuentas = await db.query(`
    SELECT ca.id_usuarios, ca.saldo_actual, ca.bl_bloqueado, ca.id_sucursal
    FROM public.t_cuenta_alumno ca
  `);
  console.log('Total cuentas en t_cuenta_alumno:', cuentas.rows.length);
  console.log('Cuentas muestra:', cuentas.rows.slice(0, 10));

  // Alumnos sin cuenta
  const sinCuenta = users.rows.filter(u => !cuentas.rows.some(c => c.id_usuarios === u.id_usuarios));
  console.log('Alumnos sin t_cuenta_alumno:', sinCuenta.length);

  // Alumnos con saldo_actual > 0 y bl_bloqueado = false
  const activosConCredito = users.rows.filter(u => {
    const c = cuentas.rows.find(ca => ca.id_usuarios === u.id_usuarios);
    return c && Number(c.saldo_actual) > 0 && !c.bl_bloqueado;
  });
  console.log('Alumnos activos con saldo_actual > 0:', activosConCredito.length, activosConCredito);

  process.exit(0);
}
run().catch(console.error);
