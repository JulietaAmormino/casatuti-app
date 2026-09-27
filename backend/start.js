import app, { runExpirationJob } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  
  // Ejecutar cron jobs localmente
  setTimeout(runExpirationJob, 5000);
  setInterval(runExpirationJob, 60 * 60 * 1000);
});
