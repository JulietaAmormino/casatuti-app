import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CakeIcon from '@mui/icons-material/Cake';
import { formatDateDDMMYYYY } from '../../../utils/dateUtils';

export default function DashboardTab({ classes, bookings, students, studentProfiles, payments, setAdminTab, navigateToStudents }) {
  const { branches, nonWorkingDays, alerts, handlePauseRequestAction } = useApp();
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const currentMonthNum = new Date().getMonth() + 1;
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const currentMonthName = monthNames[new Date().getMonth()];

  // Cumpleaños del mes en curso
  const birthdaysThisMonth = (students || []).filter(s => {
    if (!s.fecha_nacimiento) return false;
    const parts = s.fecha_nacimiento.split('T')[0].split('-');
    return parts.length >= 2 ? parseInt(parts[1], 10) === currentMonthNum : false;
  }).sort((a, b) => {
    const dayA = parseInt((a.fecha_nacimiento.split('T')[0] || '').split('-')[2], 10) || 0;
    const dayB = parseInt((b.fecha_nacimiento.split('T')[0] || '').split('-')[2], 10) || 0;
    return dayA - dayB;
  });

  // Feriados y no laborables del mes en curso
  const currentYear = new Date().getFullYear();
  const currentMonthStr = String(currentMonthNum).padStart(2, '0');
  const monthPrefix = `${currentYear}-${currentMonthStr}`;

  const holidaysThisMonth = (nonWorkingDays || [])
    .filter(n => n?.date?.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayDay = daysMap[new Date().getDay()];

  // Filtrado por sucursal
  const filteredClasses = selectedBranch === 'ALL'
    ? classes
    : classes.filter(c => (c.sucursal || '').toUpperCase() === selectedBranch.toUpperCase());

  const filteredStudents = selectedBranch === 'ALL'
    ? students
    : students.filter(s => (s.sucursal || '').toUpperCase() === selectedBranch.toUpperCase());

  const filteredStudentProfiles = studentProfiles.filter(p => {
    if (p.isBlocked) return false;
    const student = students.find(s => s.id === p.studentId);
    if (!student) return false; // Solo considerar alumnos actuales
    if (selectedBranch !== 'ALL' && (student.sucursal || '').toUpperCase() !== selectedBranch.toUpperCase()) {
      return false;
    }
    return true;
  });

  const turnosHoyCount = filteredClasses.filter(c => c.day === todayDay).length;
  const alumnosCount = filteredStudents.length;
  const paquetesActivos = filteredStudentProfiles.filter(p => p.classCredits > 0).length;
  const pendingPayments = (payments || []).filter(p => {
    if (p.status !== 'PENDING') return false;
    if (selectedBranch === 'ALL') return true;
    const st = students.find(s => s.id === p.studentId);
    return st && (st.sucursal || '').toUpperCase() === selectedBranch.toUpperCase();
  });

  const deudaTotal = filteredStudents.reduce((total, st) => {
    const studentPendingPayments = pendingPayments.filter(p => p.studentId === st.id);
    if (studentPendingPayments.length > 0) {
      // Si tiene pagos pendientes, se suma el monto de esos pagos como su deuda a verificar
      const pendingSum = studentPendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return total + pendingSum;
    }
    return total;
  }, 0);

  // Pause Requests
  const pauseRequests = (alerts || []).filter(a => a.type === 'PAUSE_REQUEST' && !a.resolved);

  // Alertas resúmenes
  const alumnasConUnCredito = filteredStudentProfiles.filter(p => p.classCredits === 1).length;

  const expiringProfiles = filteredStudentProfiles.filter(p => {
    if (p.classCredits <= 0 || !p.expirationDate) return false;
    const expDate = new Date(p.expirationDate);
    const diffTime = expDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });
  const proximosVencimientosCount = expiringProfiles.length;

  const pendingPaymentsCount = pendingPayments.length;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>

        {/* Filtro por Sucursal (Pills) */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F0EEE1', padding: '6px', borderRadius: '24px', overflowX: 'auto', width: '100%' }}>
          <button
            onClick={() => setSelectedBranch('ALL')}
            style={{
              padding: '10px 24px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: selectedBranch === 'ALL' ? '#879C8A' : 'transparent',
              color: selectedBranch === 'ALL' ? '#FFF' : 'var(--gris-oscuro)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flex: selectedBranch === 'ALL' ? 'none' : '1'
            }}
          >
            Todas
          </button>
          {branches.map((branch) => {
            const isActive = selectedBranch === branch.name;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.name)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#879C8A' : 'transparent',
                  color: isActive ? '#FFF' : 'var(--gris-oscuro)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flex: isActive ? 'none' : '1'
                }}
              >
                {branch.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats 2x2 Masonry-like Grid */}
      <div className="stats-dashboard-grid">
        {/* Card 1: Large (Turnos Hoy) */}
        <div className="stat-card-modern stat-card-modern-large" style={{ backgroundColor: '#F9E4B7', color: 'var(--gris-oscuro)', boxShadow: '0 8px 24px rgba(249,228,183,0.4)', borderRadius: '32px' }} onClick={() => setAdminTab('classes')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px', height: '44px', 
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '14px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.3)'
            }}>
              <EventIcon style={{ fontSize: '22px', color: 'var(--gris-oscuro)' }} />
            </div>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 800 }}>HOY</span>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '56px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>{turnosHoyCount}</span>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>turnos</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', opacity: 0.85 }}>Agendados para hoy</div>
            <div style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'underline', textUnderlineOffset: '4px', marginTop: '20px', cursor: 'pointer' }}>
              Ver agenda →
            </div>
          </div>
        </div>

        {/* Card 2: Top Right (Alumnos) */}
        <div className="stat-card-modern" style={{ backgroundColor: '#D98361', padding: '24px', boxShadow: '0 8px 24px rgba(217,131,97,0.3)', borderRadius: '32px' }} onClick={() => setAdminTab('students')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', color: '#FFF' }}>COMUNIDAD</div>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <GroupIcon style={{ fontSize: '20px', color: '#fff' }} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', color: '#FFF' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>{alumnosCount}</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>activos</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'rgba(255,255,255,0.9)' }}>Alumnos inscriptos</div>
          </div>
        </div>

        {/* Card 3: Bottom Right (Paquetes activos) */}
        <div className="stat-card-modern" style={{ backgroundColor: '#879C8A', padding: '24px', boxShadow: '0 8px 24px rgba(135,156,138,0.3)', borderRadius: '32px' }} onClick={() => navigateToStudents ? navigateToStudents('ACTIVE_PACKS') : setAdminTab('students')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', color: '#FFF' }}>CRÉDITOS</div>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CreditCardIcon style={{ fontSize: '20px', color: '#fff' }} />
            </div>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', color: '#FFF' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>{paquetesActivos}</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>packs</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'rgba(255,255,255,0.9)' }}>Packs vigentes</div>
          </div>
        </div>

        {/* Card 4: Full Width Bottom (Deuda total) */}
        <div className="stat-card-modern" style={{ backgroundColor: '#9AB29D', gridColumn: 'span 2', flexDirection: 'row', alignItems: 'center', padding: '24px', boxShadow: '0 8px 24px rgba(154,178,157,0.3)', borderRadius: '32px' }} onClick={() => setAdminTab('payments')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <AccountBalanceWalletIcon style={{ fontSize: '28px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', color: '#FFF', marginBottom: '4px', opacity: 0.9 }}>FINANZAS AL DÍA</div>
              <div style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1, marginBottom: '6px', color: '#FFF' }}>${deudaTotal.toLocaleString('es-AR')}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Deuda total calculada en pendientes</div>
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '20px', lineHeight: 1, paddingBottom: '2px' }}>›</span>
          </div>
        </div>
      </div>

      {/* Solicitudes de pausa */}
      {pauseRequests.length > 0 && (
        <>
          <div className="dashboard-section-header" style={{ marginTop: '16px', marginBottom: '8px' }}>
            <span className="dashboard-section-title" style={{ color: 'var(--amarillo-alerta)' }}>Solicitudes de pausa</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {pauseRequests.map(req => (
              <div key={req.id} className="stat-card-modern" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--amarillo-alerta)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--gris-oscuro)', lineHeight: '1.4' }}>
                  {req.message.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handlePauseRequestAction(req.id, true, req.metadata)}
                    className="btn-tuti btn-primary-clay"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => handlePauseRequestAction(req.id, false, req.metadata)}
                    className="btn-tuti btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', color: 'var(--rojo-alerta)' }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Alertas y vencimientos modernos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '12px', padding: '0 4px' }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gris-medio)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationsNoneIcon style={{ fontSize: '18px' }} /> ALERTAS Y VENCIMIENTOS
        </span>
        <button style={{ background: 'none', border: 'none', color: 'var(--verde-oliva)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          + Nueva alerta
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {/* Alerta: 1 crédito */}
        {alumnasConUnCredito > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#F9E4B7', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <WarningAmberIcon style={{ fontSize: '24px', color: '#D99F45' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gris-oscuro)' }}>{alumnasConUnCredito} alumnas con 1 crédito</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gris-medio)' }}>Revisar y ofrecer packs</div>
              </div>
            </div>
            <span style={{ backgroundColor: '#F9E4B7', color: '#D99F45', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>Urgente</span>
          </div>
        )}

        {/* Alerta: Pagos pendientes */}
        {pendingPaymentsCount > 0 && (
          <div onClick={() => setAdminTab('payments')} style={{ cursor: 'pointer', backgroundColor: '#fff', borderRadius: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#F0D4D4', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AccountBalanceWalletIcon style={{ fontSize: '24px', color: '#C86E6E' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gris-oscuro)' }}>{pendingPaymentsCount} pagos por confirmar</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gris-medio)' }}>Transferencias o efectivos</div>
              </div>
            </div>
            <span style={{ backgroundColor: '#F0D4D4', color: '#C86E6E', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>Pendiente</span>
          </div>
        )}

        {/* Alerta: Vencimientos */}
        {proximosVencimientosCount > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#F9E4B7', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <EventIcon style={{ fontSize: '24px', color: '#D99F45' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gris-oscuro)' }}>{proximosVencimientosCount} packs próximos a vencer</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gris-medio)' }}>En los próximos 7 días</div>
              </div>
            </div>
            <span style={{ backgroundColor: '#F9E4B7', color: '#D99F45', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>Revisar</span>
          </div>
        )}

        {/* Alerta: Cumpleaños */}
        {birthdaysThisMonth.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#E3EFDE', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CakeIcon style={{ fontSize: '24px', color: 'var(--verde-oliva)' }} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gris-oscuro)' }}>{birthdaysThisMonth.length} cumpleaños este mes</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gris-medio)' }}>Festejos próximos</div>
              </div>
            </div>
            <span style={{ backgroundColor: '#E3EFDE', color: 'var(--verde-oliva)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>Festejo</span>
          </div>
        )}

        {/* Si no hay alertas */}
        {alumnasConUnCredito === 0 && pendingPaymentsCount === 0 && proximosVencimientosCount === 0 && birthdaysThisMonth.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: 'transparent' }}>
            <span style={{ fontSize: '14px', color: 'var(--gris-medio)', fontWeight: 600 }}>No hay alertas pendientes hoy ✨</span>
          </div>
        )}
      </div>

      {/* Botón/Card de reportes */}
      <div
        className="stat-card-modern"
        onClick={() => setAdminTab('reports')}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'var(--blanco)',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer',
          marginTop: '6px'
        }}
      >
        <div className="stat-card-icon-container" style={{ color: 'var(--verde-oliva)', margin: 0, width: '40px', height: '40px', background: 'rgba(69, 95, 62, 0.1)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <BarChartIcon style={{ fontSize: '22px' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gris-oscuro)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>
            Reportes y estadísticas
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gris-medio)', lineHeight: '1.4' }}>
            Accedé a métricas, informes financieros y rendimiento de la academia.
          </div>
        </div>
        <div style={{ fontSize: '18px', color: 'var(--gris-medio)', fontWeight: 'bold' }}>
          ➔
        </div>
      </div>

      {/* Botón/Card de configuración */}
      <div
        className="stat-card-modern"
        onClick={() => setAdminTab('config')}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'var(--blanco)',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer'
        }}
      >
        <div className="stat-card-icon-container" style={{ color: 'var(--marron-arcilla)', margin: 0, width: '40px', height: '40px', background: 'var(--bg-crema)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <SettingsIcon style={{ fontSize: '22px' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gris-oscuro)', fontFamily: 'var(--font-sans)', marginBottom: '4px' }}>
            Configuración
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gris-medio)', lineHeight: '1.4' }}>
            Gestioná el calendario (feriados, días no laborables y días especiales), sucursales y normas de convivencia.
          </div>
        </div>
        <div style={{ fontSize: '18px', color: 'var(--gris-medio)', fontWeight: 'bold' }}>
          ➔
        </div>
      </div>

      {/* Sección de cumpleaños y calendario del mes */}
      <div className="dashboard-section-header" style={{ marginTop: '16px', marginBottom: '8px' }}>
        <span className="dashboard-section-title">Agenda de {currentMonthName}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {/* Columna de cumpleaños */}
        <div className="stat-card-modern" style={{ backgroundColor: 'var(--blanco)', border: 'none', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--gris-oscuro)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--verde-oliva)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎂</span> Cumpleaños del mes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
            {birthdaysThisMonth.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--gris-medio)', margin: 0 }}>No hay cumpleaños registrados este mes.</p>
            ) : (
              birthdaysThisMonth.map(b => {
                const day = parseInt((b.fecha_nacimiento.split('T')[0] || '').split('-')[2], 10) || 0;
                return (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-crema-claro)', padding: '10px 14px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gris-oscuro)' }}>{b.name} {b.lastname || ''}</span>
                    <span className="badge badge-oliva" style={{ fontSize: '11px', fontWeight: 800 }}>{formatDateDDMMYYYY(b.fecha_nacimiento)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Columna de feriados y días no laborables */}
        <div className="stat-card-modern" style={{ backgroundColor: 'var(--blanco)', border: 'none', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--gris-oscuro)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--marron-arcilla)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> Feriados y no laborables
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
            {holidaysThisMonth.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--gris-medio)', margin: 0 }}>No hay feriados o días no laborables este mes.</p>
            ) : (
              holidaysThisMonth.map(h => {
                const day = parseInt(h.date.split('-')[2], 10);
                return (
                  <div key={h.date} style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'var(--bg-crema-claro)', padding: '10px 14px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-clay" style={{ fontSize: '11px', fontWeight: 800 }}>{formatDateDDMMYYYY(h.date)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gris-medio)', fontWeight: 600 }}>{h.reason.split(' - ')[0]}</span>
                    </div>
                    {h.reason.split(' - ')[1] && (
                      <span style={{ fontSize: '12px', color: 'var(--gris-oscuro)', fontWeight: 500 }}>{h.reason.split(' - ')[1]}</span>
                    )}
                    {!h.reason.includes(' - ') && (
                      <span style={{ fontSize: '12px', color: 'var(--gris-oscuro)', fontWeight: 500 }}>{h.reason}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
