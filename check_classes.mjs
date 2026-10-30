import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function run() {
  const { default: db } = await import('./backend/db.js');
  const classes = await db.query(`
    SELECT c.id_clase, c.dia, c.horario, s.n_sucursal, c.id_sucursal
    FROM public.t_clases c
    LEFT JOIN public.t_sucursales s ON s.id_sucursal = c.id_sucursal
    LIMIT 10
  `);
  console.log('Classes:', classes.rows);

  const branches = await db.query(`SELECT * FROM public.t_sucursales`);
  console.log('Branches:', branches.rows);

  process.exit(0);
}
run().catch(console.error);
