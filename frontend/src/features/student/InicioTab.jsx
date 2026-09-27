import { useState } from 'react';
import { createPortal } from 'react-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useApp } from '../../context/AppContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DrawIcon from '@mui/icons-material/Draw';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

const NORMAS_ICONS = [
  <DrawIcon style={{ color: '#E48F45', fontSize: '20px' }} />,
  <CleaningServicesIcon style={{ color: '#3A7056', fontSize: '20px' }} />,
  <FavoriteIcon style={{ color: '#D65A31', fontSize: '20px' }} />,
  <LightbulbIcon style={{ color: '#F1C40F', fontSize: '20px' }} />,
];

export default function InicioTab({
  currentUser,
  profile,
  bookings,
  myBookings,
  myAlerts,
  bookingError,
  classes,
  payments,
  bakes,
  resolveAlertAction,
  onCancel,
  onReprogramar,
  onOpenBuyModal,
  onGoToTurnos,
  onGoToCreditos,
}) {
  const { faqs = [] } = useApp();
  const [showDebtsModal, setShowDebtsModal] = useState(false);

  const [showNoCreditsError, setShowNoCreditsError] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');

  const myPendingPayments = (payments || []).filter(
    p => p.studentId == currentUser.id && p.status === 'PENDING'
  );

  const myPendingInsumos = (bakes || []).filter(
    b => b.studentId == currentUser.id && !b.isPaid && b.price > 0
  );

  const pendingDebt =
    myPendingPayments.reduce((sum, p) => sum + Number(p.amount), 0) +
    myPendingInsumos.reduce((sum, b) => sum + Number(b.price), 0);

  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [isNormasExpanded, setIsNormasExpanded] = useState(true);

  return (
    <>
      {/* Resumen (Estilo Dashboard) */}
      <div>
        {/* Header TU TALLER AL DÍA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gris-medio)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
            TU TALLER AL DÍA
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#EFEFEF', color: 'var(--gris-medio)', padding: '4px 10px', borderRadius: '12px' }}>
            Ciclo 2026
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gridTemplateRows: 'auto auto', gap: '12px' }}>

          {/* Card Créditos (Izquierda - span 2 rows) */}
          <div
            onClick={() => {
              if (profile.classCredits > 0 && onGoToTurnos) {
                onGoToTurnos();
                setShowNoCreditsError(false);
              } else {
                setShowNoCreditsError(true);
                setTimeout(() => setShowNoCreditsError(false), 5000);
              }
            }}
            style={{
              backgroundColor: '#F7E7B8',
              borderRadius: '28px',
              padding: '20px',
              gridRow: 'span 2',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(247,231,184,0.3)',
              position: 'relative',
              minHeight: '190px'
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gris-oscuro)" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.4)', padding: '6px 12px', borderRadius: '16px', color: 'var(--gris-oscuro)' }}>
                CRÉDITOS
              </span>
            </div>

            {/* Main content */}
            <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '56px', fontWeight: 900, color: 'var(--gris-oscuro)', lineHeight: 1 }}>{profile.classCredits}</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gris-oscuro)' }}>clases</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gris-oscuro)', marginTop: '4px' }}>
                Disponibles
              </div>
            </div>

            {/* Bottom link */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (onGoToCreditos) onGoToCreditos();
              }}
              style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gris-oscuro)', textDecoration: 'underline', textUnderlineOffset: '4px', cursor: 'pointer' }}
            >
              Ver historial →
            </div>
          </div>

          {/* Card Arcilla (Arriba Derecha) */}
          <div style={{
            backgroundColor: '#95B09E',
            borderRadius: '28px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2), 0 8px 24px rgba(149,176,158,0.3)',
            color: 'var(--verde-oliva)',
            minHeight: '120px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.5px' }}>ARCILLA</span>
              <span style={{ fontSize: '20px' }}>🏺</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1 }}>{profile.monthlyClayKg}</span>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>kg retirados</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(15, 59, 50, 0.15)', borderRadius: '2px', marginTop: '8px' }}></div>
            </div>
          </div>

          {/* Card Estado de Cuenta (Abajo Derecha) */}
          <div
            onClick={() => { if (pendingDebt > 0) setShowDebtsModal(true); }}
            style={{
              backgroundColor: 'var(--blanco)',
              borderRadius: '28px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              cursor: pendingDebt > 0 ? 'pointer' : 'default',
              border: pendingDebt > 0 ? '1px solid #FFEBEB' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gris-medio)', letterSpacing: '0.5px' }}>ESTADO DE CUENTA</span>
              {pendingDebt === 0 && (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EAF2E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verde-oliva)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: pendingDebt > 0 ? 'var(--rojo-alerta)' : 'var(--gris-oscuro)', lineHeight: 1 }}>
                ${pendingDebt.toLocaleString('es-AR')}
              </span>
              {pendingDebt === 0 ? (
                <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#EAF2E8', color: 'var(--verde-oliva)', padding: '4px 10px', borderRadius: '12px' }}>
                  ¡Al día! 🎉
                </span>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#FFEBEB', color: 'var(--rojo-alerta)', padding: '4px 10px', borderRadius: '12px' }}>
                  Abonar
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Alertas */}
      {bookingError && (
        <div className="alert-banner danger animate-slide-up">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <WarningAmberIcon style={{ fontSize: '18px' }} /> {bookingError}
          </span>
        </div>
      )}
      {myAlerts.map(a => (
        <div key={a.id} className="alert-banner info animate-slide-up" style={{ justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationsIcon style={{ fontSize: '18px' }} /> {a.message}
          </span>
          {resolveAlertAction && (
            <button
              onClick={() => resolveAlertAction(a.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', marginLeft: '12px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Reservas Activas */}
      <div>
        <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gris-medio)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', marginBottom: '16px', padding: '0 4px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            MIS RESERVAS ACTIVAS
          </div>
          <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#95B09E', color: 'var(--blanco)', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            {myBookings.length}
          </span>
        </h3>
        {myBookings.length === 0 ? (
          <div style={{
            border: '2px dashed rgba(149, 176, 158, 0.4)',
            borderRadius: '24px',
            padding: '32px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(149, 176, 158, 0.05)',
            gap: '12px'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#F7E7B8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--marron-arcilla)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path><line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round"></line></svg>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--gris-medio)', fontWeight: 600, margin: 0, textAlign: 'center' }}>No tienes reservas activas.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myBookings.map(b => {
              const cd = classes.find(c => c.id === b.classId) || {};
              const classBookings = bookings?.filter(
                allB => allB.classId === b.classId && allB.date === b.date &&
                  (allB.status === 'CONFIRMED' || allB.status === 'ATTENDED')
              ) || [];

              return (
                <div
                  key={b.id}
                  onClick={() => setExpandedBookingId(expandedBookingId === b.id ? null : b.id)}
                  style={{
                    padding: '20px',
                    borderRadius: '28px',
                    backgroundColor: 'var(--blanco)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gris-oscuro)', margin: 0 }}>
                        {cd.day} {b.date ? formatDateDDMMYYYY(b.date) : ''} · {cd.time}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--gris-medio)', marginTop: '4px', fontWeight: 600 }}>
                        <LocationOnIcon style={{ fontSize: '14px', verticalAlign: 'text-bottom' }} /> {cd.sucursal} · Prof. {cd.teacherName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        {(() => {
                          const classStartDateTime = new Date(`${b.date}T${cd.time.split(' - ')[0]}:00`);
                          const hoursDiff = (classStartDateTime - new Date()) / (1000 * 60 * 60);
                          const canReschedule = hoursDiff > 2;
                          return canReschedule && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onReprogramar && onReprogramar(b.id); }}
                              style={{ background: 'transparent', border: '1px solid var(--marron-arcilla)', borderRadius: '16px', fontSize: '12px', color: 'var(--marron-arcilla)', fontWeight: 800, cursor: 'pointer', padding: '4px 10px' }}
                            >
                              Reprogramar
                            </button>
                          );
                        })()}
                        <button
                          onClick={(e) => { e.stopPropagation(); onCancel(b.id); }}
                          style={{ background: 'transparent', border: 'none', fontSize: '12px', color: 'var(--rojo-alerta)', fontWeight: 800, cursor: 'pointer', padding: '4px 10px', alignSelf: 'center' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Detalle Inscriptas */}
                  {expandedBookingId === b.id && classBookings.length > 0 && (
                    <div style={{
                      borderTop: '1px solid #ECEFEC',
                      paddingTop: '12px',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      animation: 'fadeIn 0.2s ease-in-out'
                    }}>
                      <div style={{ fontWeight: '700', color: '#0F3B32' }}>Alumnas anotadas:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {classBookings.map((eb, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: eb.studentId === currentUser.id ? 'var(--verde-oliva-light)' : '#F3F6F4',
                              color: eb.studentId === currentUser.id ? 'var(--verde-oliva-dark)' : '#2E4A3F',
                              padding: '4px 10px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: eb.studentId === currentUser.id ? '800' : '500',
                              border: eb.studentId === currentUser.id ? '1px solid var(--verde-oliva)' : '1px solid transparent'
                            }}
                          >
                            {eb.studentName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Normas de convivencia (Carousel) */}
      {faqs && faqs.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gris-medio)', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Normas de convivencia
            </h3>
            
            <div style={{ position: 'relative', width: '160px' }}>
              <input
                type="text"
                placeholder="Buscar..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 32px',
                  borderRadius: '16px',
                  border: '1px solid #EAEAEA',
                  backgroundColor: 'var(--blanco)',
                  fontSize: '12px',
                  outline: 'none',
                  color: 'var(--gris-oscuro)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                }}
              />
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gris-medio)' }} width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              gap: '16px', 
              paddingBottom: '16px', 
              paddingInline: '4px',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE and Edge
            }}
            className="hide-scrollbar"
          >
            {(() => {
              const filtered = faqs.filter(faq => 
                faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
              );
              
              if (filtered.length === 0) {
                return (
                  <div style={{ padding: '16px', color: 'var(--gris-medio)', fontSize: '13px', fontStyle: 'italic' }}>
                    No se encontraron normas que coincidan con tu búsqueda.
                  </div>
                );
              }

              return filtered.map((faq, idx) => {
                const colors = [
                  { bg: '#FDFCF6', iconBg: '#F7E7B8', border: '#EFEAE0' },
                  { bg: '#F6F9F7', iconBg: '#E3EFDE', border: '#E2E8E4' },
                  { bg: '#FEF8F7', iconBg: '#FCE0DB', border: '#F2E4E2' },
                  { bg: '#F8F9FB', iconBg: '#E5EDF4', border: '#E6E9EE' },
                ];
                const color = colors[idx % colors.length];

                return (
                  <div 
                    key={faq.id} 
                    style={{ 
                      minWidth: '260px', 
                      maxWidth: '260px',
                      backgroundColor: color.bg, 
                      borderRadius: '24px', 
                      padding: '20px', 
                      scrollSnapAlign: 'start',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      border: `1px solid ${color.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: color.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {NORMAS_ICONS[idx % NORMAS_ICONS.length]}
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--gris-oscuro)', margin: 0, lineHeight: 1.3, alignSelf: 'center' }}>
                        {faq.question}
                      </h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--gris-medio)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                      {faq.answer}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Modal Detalles de Deudas */}
      {showDebtsModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowDebtsModal(false)}>
          <div className="modal-content animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--gris-oscuro)' }}>Detalle de deudas</h2>
              <button onClick={() => setShowDebtsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gris-medio)' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {myPendingPayments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-crema)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gris-oscuro)' }}>
                      {(p.motivo || 'Deuda pendiente').charAt(0).toUpperCase() + (p.motivo || 'Deuda pendiente').slice(1).toLowerCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gris-medio)', marginTop: '4px' }}>
                      {formatDateDDMMYYYY(p.date || new Date())}
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--rojo-alerta)' }}>
                    ${Number(p.amount).toLocaleString('es-AR')}
                  </div>
                </div>
              ))}
              {myPendingInsumos.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--bg-crema)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gris-oscuro)' }}>
                      {(b.description || 'Deuda de insumos').charAt(0).toUpperCase() + (b.description || 'Deuda de insumos').slice(1).toLowerCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gris-medio)', marginTop: '4px' }}>
                      {formatDateDDMMYYYY(b.date || new Date())}
                    </div>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--rojo-alerta)' }}>
                    ${Number(b.price).toLocaleString('es-AR')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--gris-claro)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gris-oscuro)' }}>Total a abonar</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--rojo-alerta)' }}>
                ${pendingDebt.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
