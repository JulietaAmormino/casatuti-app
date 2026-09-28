import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export default function AlumnosTabProfe({ currentUser, users, classes, bookings, studentProfiles, selectedBranch, myBranches }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Obtener todos los alumnos registrados en el sistema
  // Y filtrarlos por la sucursal seleccionada (o las sucursales del profe si es "ALL")
  const baseStudents = users.filter(u => {
    if (u.role !== 'ALUMNO') return false;
    
    if (selectedBranch === 'ALL') {
      // Si el profe seleccionó "Todas", mostrar los alumnos de todas las sucursales donde el profe da clases
      // O si el profe no tiene sucursales todavía, al menos no romperse.
      if (myBranches && myBranches.length > 0) {
        return myBranches.includes(u.sucursal);
      }
      return true; // fallback
    } else {
      // Si seleccionó una sucursal específica, mostrar solo alumnos de esa sucursal
      return u.sucursal === selectedBranch;
    }
  });

  // 2. Combinar con studentProfiles para obtener los créditos y arcilla
  const myStudents = baseStudents.map(s => {
    const profile = studentProfiles.find(p => p.studentId === s.id) || { classCredits: 0, monthlyClayKg: 0 };
    return {
      ...s,
      classes: '-', // Ya no dependemos de las inscripciones para esto, mostramos genérico o nada
      credits: profile.classCredits,
      clay: profile.monthlyClayKg
    };
  });

  // 3. Filtrar por búsqueda
  const filteredStudents = myStudents.filter(s => 
    s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-slide-up">
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gris-oscuro)', marginBottom: '16px' }}>
        Directorio de Alumnos/as <span style={{ fontSize: '10px', color: 'gray' }}>(v2)</span>
      </h3>

      {/* Buscador */}
      <div className="form-group" style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type="text" 
          className="input-tuti" 
          placeholder="Buscar alumno/a por nombre..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <SearchIcon style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--gris-medio)' }} />
      </div>

      {/* Lista de Alumnos */}
      {filteredStudents.length === 0 ? (
        <div className="clay-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--gris-medio)' }}>
          <p style={{ fontStyle: 'italic', margin: 0 }}>No se encontraron alumnos/as en esta sucursal.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredStudents.map(student => (
            <div key={student.id} className="clay-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gris-oscuro)', margin: 0 }}>
                    {student.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--gris-medio)', margin: '4px 0 0 0', fontWeight: 600 }}>
                    Clases: {student.classes}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${student.clay >= 1.0 ? 'badge-oliva' : 'badge-clay'}`} style={{ fontSize: '10px', padding: '4px 8px', display: 'block', marginBottom: '4px' }}>
                    Arcilla: {student.clay}kg
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '4px 8px', display: 'block' }}>
                    Créditos: {student.credits}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
