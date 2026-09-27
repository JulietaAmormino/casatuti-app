import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import DashboardTab  from './tabs/DashboardTab';
import StudentsTab   from './tabs/StudentsTab';
import TeachersTab   from './tabs/TeachersTab';
import ClassesTab    from './tabs/ClassesTab';
import PaymentsTab   from './tabs/PaymentsTab';
import ConfigTab     from './tabs/ConfigTab';
import ReportsTab    from './tabs/ReportsTab';
import EditUserModal from './components/EditUserModal';
import PerfilTab     from '../student/PerfilTab';

const TABS = [
  { id: 'dashboard', label: 'Resumen'    },
  { id: 'students',  label: 'Alumnas'    },
  { id: 'teachers',  label: 'Profesores' },
  { id: 'classes',   label: 'Turnos'     },
  { id: 'payments',  label: 'Pagos'      },
  { id: 'reports',   label: 'Reportes'   },
  { id: 'config',    label: 'Config'     },
];

export default function AdminView({ activeTab = 'dashboard', setActiveTab = () => {} }) {
  const { users, studentProfiles, classes, bookings, payments, currentUser } = useApp();

  const [alertMsg, setAlertMsg]       = useState({ text: '', type: '' });
  const [editUserId, setEditUserId]   = useState(null); // null = modal cerrado
  const [studentsFilter, setStudentsFilter] = useState(null);

  const students = users.filter(u => u.role === 'ALUMNO');

  const showFeedback = (text, type = 'info') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg({ text: '', type: '' }), 4000);
  };

  const openEdit  = (user) => setEditUserId(user.id);
  const closeEdit = ()     => setEditUserId(null);

  const TAB_TITLES = {
    students: 'Alumnas',
    teachers: 'Profesores',
    classes: 'Turnos',
    payments: 'Pagos',
    reports: 'Reportes',
    config: 'Configuración',
    perfil: 'Mi Perfil'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {alertMsg.text && (
        <div className={`alert-banner ${alertMsg.type === 'danger' ? 'danger' : 'info'}`}>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Modern Welcome Banner for Admin */}
      {activeTab === 'dashboard' && (
        <div style={{
          backgroundColor: '#F8F9FA',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#E3EFDE', color: 'var(--verde-oliva)', padding: '6px 12px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--verde-oliva)' }}></div>
              Panel de Administración
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--gris-oscuro)', margin: 0 }}>
              ¡Hola, {currentUser?.nombre || currentUser?.name || 'Admin'}! ✨
            </h2>
          </div>
        </div>
      )}

      {/* Contenido de cada tab */}
      {activeTab === 'dashboard' && (
        <DashboardTab
          classes={classes}
          bookings={bookings}
          students={students}
          studentProfiles={studentProfiles}
          payments={payments}
          setAdminTab={setActiveTab}
          navigateToStudents={(filter) => {
            setStudentsFilter(filter);
            setActiveTab('students');
          }}
        />
      )}

      {activeTab === 'students' && (
        <StudentsTab 
          showFeedback={showFeedback} 
          onEdit={openEdit} 
          initialFilter={studentsFilter} 
          onClearFilter={() => setStudentsFilter(null)} 
        />
      )}

      {activeTab === 'teachers' && (
        <TeachersTab showFeedback={showFeedback} onEdit={openEdit} />
      )}

      {activeTab === 'classes' && (
        <ClassesTab showFeedback={showFeedback} />
      )}

      {activeTab === 'payments' && (
        <PaymentsTab showFeedback={showFeedback} />
      )}

      {activeTab === 'config' && (
        <ConfigTab showFeedback={showFeedback} goBack={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'reports' && (
        <ReportsTab goBack={() => setActiveTab('dashboard')} />
      )}

      {activeTab === 'perfil' && (
        <PerfilTab />
      )}

      {/* Modal de edición compartido */}
      {editUserId && (
        <EditUserModal
          userId={editUserId}
          onClose={closeEdit}
          showFeedback={showFeedback}
        />
      )}
    </div>
  );
}
