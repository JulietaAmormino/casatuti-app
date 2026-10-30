const fetch = require('node-fetch');

async function testSwitch() {
  const { Client } = require('pg');
  const db = new Client({ connectionString: 'postgresql://postgres.vljetkmhgyffopzvzvwf:Ctuti112614!@aws-1-us-west-2.pooler.supabase.com:6543/postgres' });
  await db.connect();

  const { rows } = await db.query("SELECT id_usuarios, nombre, rol, secondary_role FROM public.t_usuarios WHERE nombre IN ('Santi', 'Marcos', 'Santiago') LIMIT 1");
  console.log("Before:", rows[0]);

  if (!rows.length) return;

  const id = rows[0].id_usuarios;

  const res = await fetch('http://localhost:5000/api/auth/switch-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const data = await res.json();
  console.log("Switch Response:", data);

  const { rows: rowsAfter } = await db.query("SELECT id_usuarios, nombre, rol, secondary_role FROM public.t_usuarios WHERE id_usuarios = $1", [id]);
  console.log("After:", rowsAfter[0]);
  
  await db.end();
}

testSwitch();
