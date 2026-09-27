const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM public.t_faqs');
    if (res.rows[0].count === '0') {
      console.log('No FAQs found, inserting dummies...');
      await pool.query(`
        INSERT INTO public.t_faqs (pregunta, respuesta) VALUES 
        ('Puntualidad', 'Te pedimos llegar 5 minutos antes del turno para acomodarte.'),
        ('Limpieza', 'Al terminar tu turno, dejá las herramientas y el torno limpio.'),
        ('Piezas', 'Identificá siempre tus piezas con tu firma para evitar confusiones.'),
        ('Horno', 'Las horneadas pueden demorar hasta 15 días, ¡tené paciencia!')
      `);
      console.log('Dummies inserted.');
    } else {
      console.log('FAQs already exist:', res.rows[0].count);
    }
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
})();
