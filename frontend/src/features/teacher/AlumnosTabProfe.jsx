import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export default function AlumnosTabProfe({ currentUser, classes, bookings, studentProfiles }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Obtener las clases del profesor
  const myClasses = classes.filter(c => 
    (c.teacherIds && c.teacherIds.some(id => String(id) === String(currentUser.id))) || 
    String(c.teacherId) === String(currentUser.id)
  );
  const myClassesIds = myClasses.map(c => String(c.id));

  // 2. Obtener todos los alumnos que tienen alguna reserva en las clases del profesor
  const myStudentsMap = new Map();
  bookings.forEach(b => {
    if (myClassesIds.includes(String(b.classId)) && b.status !== 'CANCELLED') {
      if (!myStudentsMap.has(b.studentId)) {
        myStudentsMap.set(b.studentId, {
          id: b.studentId,
          name: b.studentName,
          classes: new Set([classes.find(c => String(c.id) === String(b.classId))?.name])
        });
      } else {
        myStudentsMap.get(b.studentId).classes.add(classes.find(c => String(c.id) === String(b.classId))?.name);
      }
    }
  });

  const myStudents = Array.from(myStudentsMap.values()).map(s => {
    const profile = studentProfiles.find(p => p.studentId === s.id) || { classCredits: 0, monthlyClayKg: 0 };
    return {
      ...s,
      classes: Array.from(s.classes).join(', '),
      credits: profile.classCredits,
      clay: profile.monthlyClayKg
    };
  });

  // 3. Filtrar por búsqueda
  const filteredStudents = myStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p style={{ fontStyle: 'italic', margin: 0 }}>No se encontraron alumnos/as.</p>
          <div style={{ marginTop: '20px', fontSize: '11px', textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
            <strong>Debug Diagnostics (v3):</strong><br/>
            - currentUser.id: {currentUser?.id}<br/>
            - Total classes passed: {classes?.length}<br/>
            - myClasses matched: {myClasses?.length}<br/>
            - myClassesIds: {myClassesIds?.join(', ')}<br/>
            - Total bookings passed: {bookings?.length}<br/>
            - Bookings matching my classes: {bookings?.filter(b => myClassesIds.includes(String(b.classId))).length}<br/>
            - Bookings not cancelled: {bookings?.filter(b => myClassesIds.includes(String(b.classId)) && b.status !== 'CANCELLED').length}<br/>
            - myStudentsMap size: {myStudentsMap.size}<br/>
            - searchTerm: "{searchTerm}"
          </div>
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
