const { Client } = require('pg');
const db = new Client({ connectionString: 'postgresql://postgres.vljetkmhgyffopzvzvwf:Ctuti112614!@aws-1-us-west-2.pooler.supabase.com:6543/postgres' });
db.connect().then(async () => {
  await db.query("UPDATE public.t_usuarios SET secondary_role = 'PROFE' WHERE id_usuarios = 3");
  const { rows } = await db.query("SELECT id_usuarios, nombre, rol, secondary_role FROM public.t_usuarios WHERE nombre IN ('Santi', 'Marcos', 'Santiago')");
  console.log(rows);
  await db.end();
});
