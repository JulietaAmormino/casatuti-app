import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiService as mockService } from '../api/apiService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de un AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const seenAlertIdsRef = useRef(new Set());
  const [users, setUsers] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clayDeliveries, setClayDeliveries] = useState([]);
  const [bakes, setBakes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [nonWorkingDays, setNonWorkingDays] = useState([]);
  const [packs, setPacks] = useState([]);
  const [extras, setExtras] = useState([]);
  const [branches, setBranches] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar todos los datos desde el servicio
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await mockService.initializeDB();
      const [
        loadedUsers,
        loadedProfiles,
        loadedClasses,
        loadedBookings,
        loadedDeliveries,
        loadedBakes,
        loadedPayments,
        loadedAlerts,
        loadedWaitlist,
        loadedNonWorkingDays,
        loadedPacks,
        loadedExtras,
        loadedBranches,
        loadedFaqs
      ] = await Promise.all([
        mockService.getUsers().catch(() => ({ error: true })),
        mockService.getStudentProfiles().catch(() => ({ error: true })),
        mockService.getClasses().catch(() => ({ error: true })),
        mockService.getBookings().catch(() => ({ error: true })),
        mockService.getClayDeliveries().catch(() => ({ error: true })),
        mockService.getBakes().catch(() => ({ error: true })),
        mockService.getPayments().catch(() => ({ error: true })),
        mockService.getAlerts().catch(() => ({ error: true })),
        mockService.getWaitlist().catch(() => ({ error: true })),
        mockService.getNonWorkingDays().catch(() => ({ error: true })),
        mockService.getPacks().catch(() => ({ error: true })),
        mockService.getExtras().catch(() => ({ error: true })),
        mockService.getBranches().catch(() => ({ error: true })),
        mockService.getFaqs().catch(() => ({ error: true }))
      ]);

      if (!loadedUsers.error) setUsers(loadedUsers);
      if (!loadedProfiles.error) setStudentProfiles(loadedProfiles);
      if (!loadedClasses.error) setClasses(loadedClasses);
      if (!loadedBookings.error) setBookings(loadedBookings);
      if (!loadedDeliveries.error) setClayDeliveries(loadedDeliveries);
      if (!loadedBakes.error) setBakes(loadedBakes);
      if (!loadedPayments.error) setPayments(loadedPayments);
      if (!loadedAlerts.error) setAlerts(loadedAlerts);
      if (!loadedWaitlist.error) setWaitlist(loadedWaitlist);
      if (!loadedNonWorkingDays.error) setNonWorkingDays(loadedNonWorkingDays || []);
      if (!loadedPacks.error) setPacks(loadedPacks || []);
      if (!loadedExtras.error) setExtras(loadedExtras || []);
      if (!loadedBranches.error) setBranches(loadedBranches || []);
      if (!loadedFaqs.error) setFaqs(loadedFaqs || []);

      // Administrar alertas vistas para no duplicar notificaciones nativas
      if (!loadedAlerts.error) {
        const currentUserId = currentUser?.id || currentUser?.id_usuarios;
        if (!silent) {
          loadedAlerts.forEach(a => seenAlertIdsRef.current.add(a.id));
        } else if (currentUserId) {
          const newAlerts = loadedAlerts.filter(
            a => a.studentId === currentUserId && !a.resolved && !seenAlertIdsRef.current.has(a.id)
          );
          if (newAlerts.length > 0) {
            newAlerts.forEach(alert => {
              seenAlertIdsRef.current.add(alert.id);
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('Casa tuti', {
                    body: alert.message,
                    vibrate: [200, 100, 200]
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(perm => {
                    if (perm === 'granted') {
                      new Notification('Casa tuti', {
                        body: alert.message,
                        vibrate: [200, 100, 200]
                      });
                    }
                  });
                }
              }
            });
          }
        }
      }

      // Comprobar si hay una sesión guardada en localStorage o actualizar usuario actual en tiempo real
      if (!loadedUsers.error) {
        const savedUserId = localStorage.getItem('tuti_session_user_id');
        if (savedUserId) {
          const savedUser = loadedUsers.find(u => u.id?.toString() === savedUserId.toString());
          if (savedUser) {
            setCurrentUser(savedUser);
            setIsAuthenticated(true);
          }
        }
      }
    } catch (error) {
      console.error("Error cargando los datos de la DB simulada:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);

    // Pedir permiso para notificaciones nativas en dispositivo
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    let isPolling = true;
    const pollData = async () => {
      while (isPolling) {
        await new Promise(resolve => setTimeout(resolve, 30000));
        if (isPolling) {
          await loadData(true);
        }
      }
    };
    pollData();

    return () => { isPolling = false; };
  }, []);

  // Login Acción
  const loginAction = async (email, password) => {
    setLoading(true);
    try {
      const user = await mockService.login(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('tuti_session_user_id', user.id);
      return user;
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Acción
  const forgotPasswordAction = async (email) => {
    setLoading(true);
    try {
      return await mockService.forgotPassword(email);
    } finally {
      setLoading(false);
    }
  };

  // Logout Acción
  const logoutAction = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tuti_session_user_id');
  };

  // Cambiar rol de un usuario (para soporte / configurador)
  const changeUserRole = async (userId, newRole) => {
    setLoading(true);
    try {
      const updatedUser = await mockService.updateUserRole(userId, newRole);
      
      // Recargar listado de usuarios
      const loadedUsers = await mockService.getUsers();
      setUsers(loadedUsers);

      // Si el usuario modificado es el actual logueado, actualizamos su rol de inmediato en memoria
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
      }
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar rol secundario de un usuario
  const updateUserSecondaryRole = async (userId, secondaryRole) => {
    setLoading(true);
    try {
      const updatedUser = await mockService.updateUserSecondaryRole(userId, secondaryRole);
      const loadedUsers = await mockService.getUsers();
      setUsers(loadedUsers);
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
      }
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar de perfil (si tiene rol secundario)
  const switchProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const updatedUser = await mockService.switchProfile(currentUser.id);
      setCurrentUser(updatedUser);
      await loadData();
    } catch (err) {
      console.error("Error cambiando de perfil", err);
    } finally {
      setLoading(false);
    }
  };

  // Impersonación: cambiar de usuario
  const changeUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('tuti_session_user_id', user.id);
    }
  };

  // Restablecer base de datos
  const resetDatabase = async () => {
    setLoading(true);
    await mockService.initializeDB(true);
    logoutAction(); // Cerrar sesión tras el reset
    await loadData();
  };

  // --- LÓGICA DE NEGOCIO ---

  // 1. Reservar clase — Optimistic UI
  const bookClass = async (classId, dateStr) => {
    const studentId = currentUser.id;
    const studentName = currentUser.name;
    const profile = studentProfiles.find(p => p.studentId === studentId);
    const classData = classes.find(c => c.id === classId);

    if (!profile) {
      throw new Error("No tenés créditos disponibles para reservar esta clase. Comprá un pack de clases desde la sección Créditos.");
    }
    if (!classData) {
      throw new Error("No se encontró la clase seleccionada. Intentá de nuevo.");
    }
    if (classData.pausedDates && classData.pausedDates.includes(dateStr)) {
      throw new Error("Este turno se encuentra pausado para la fecha seleccionada.");
    }
    if (profile.isBlocked) {
      throw new Error("Tu cuenta está pausada. No puedes realizar nuevas reservas.");
    }
    if (profile.classCredits <= 0) {
      mockService.createAlert({
        type: 'NO_CREDITS',
        message: `El alumno ${studentName} intentó reservar "${classData.name}" (${classData.day} - ${classData.time}) pero no tiene créditos de clase.`
      }).then(() => mockService.getAlerts().then(setAlerts));
      throw new Error("No tienes créditos de clase disponibles. Contacta al administrador.");
    }
    const existingBooking = bookings.find(
      b => b.studentId === studentId && b.classId === classId && b.date === dateStr && b.status !== 'CANCELLED'
    );
    if (existingBooking) {
      throw new Error("Ya tienes una reserva activa para esta clase en esa fecha.");
    }
    const activeBookingsForClass = bookings.filter(
      b => b.classId === classId && b.date === dateStr && (b.status === 'CONFIRMED' || b.status === 'ATTENDED')
    );
    if (activeBookingsForClass.length >= classData.capacity) {
      throw new Error("Esta clase ya no tiene cupos disponibles para la fecha seleccionada.");
    }

    // Optimistic: mostrar reserva y descontar crédito de inmediato
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticBooking = { id: optimisticId, studentId, studentName, classId, date: dateStr, status: 'CONFIRMED', className: classData.name, classTime: classData.time, classDay: classData.day };
    setBookings(prev => [...prev, optimisticBooking]);
    setStudentProfiles(prev => prev.map(p =>
      p.studentId === studentId ? { ...p, classCredits: p.classCredits - 1 } : p
    ));

    try {
      const newBooking = await mockService.createBooking({ studentId, studentName, classId, date: dateStr, status: 'CONFIRMED' });
      // Re-fetch silencioso en background
      Promise.all([
        mockService.getBookings().then(setBookings),
        mockService.getStudentProfiles().then(setStudentProfiles),
        mockService.getAlerts().then(setAlerts),
        mockService.getWaitlist().catch(() => []).then(setWaitlist),
      ]);
      return newBooking;
    } catch (err) {
      // Revertir estado optimista
      setBookings(prev => prev.filter(b => b.id !== optimisticId));
      setStudentProfiles(prev => prev.map(p =>
        p.studentId === studentId ? { ...p, classCredits: p.classCredits + 1 } : p
      ));
      throw err;
    }
  };

  // 1b. Reservar clase para otro alumno (por el profesor) — Optimistic UI
  const bookClassForStudent = async (studentId, classId, dateStr) => {
    const student = users.find(u => u.id === studentId);
    if (!student) throw new Error("Alumno no encontrado");
    const studentName = student.name;
    const profile = studentProfiles.find(p => p.studentId === studentId);
    const classData = classes.find(c => c.id === classId);

    if (!profile) throw new Error("La alumna no tiene créditos disponibles para reservar esta clase.");
    if (!classData) throw new Error("No se encontró la clase seleccionada. Intentá de nuevo.");
    if (classData.pausedDates && classData.pausedDates.includes(dateStr)) throw new Error("Este turno se encuentra pausado para la fecha seleccionada.");
    if (profile.isBlocked) throw new Error("La cuenta del alumno está pausada. No puedes realizar reservas.");
    if (profile.classCredits <= 0) throw new Error("La alumna no tiene créditos de clase disponibles.");
    const existingBooking = bookings.find(
      b => b.studentId === studentId && b.classId === classId && b.date === dateStr && (b.status === 'CONFIRMED' || b.status === 'ATTENDED')
    );
    if (existingBooking) throw new Error("La alumna ya se encuentra inscripta en esta clase.");
    const activeBookingsForClass = bookings.filter(b => b.classId === classId && b.date === dateStr && (b.status === 'CONFIRMED' || b.status === 'ATTENDED'));
    if (activeBookingsForClass.length >= classData.capacity) throw new Error("No hay cupo disponible en esta clase.");

    // Optimistic
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticBooking = { id: optimisticId, studentId, studentName, classId, date: dateStr, status: 'CONFIRMED', className: classData.name, classTime: classData.time, classDay: classData.day };
    setBookings(prev => [...prev, optimisticBooking]);
    setStudentProfiles(prev => prev.map(p =>
      p.studentId === studentId ? { ...p, classCredits: p.classCredits - 1 } : p
    ));

    try {
      const newBooking = await mockService.createBooking({ studentId, studentName, classId, date: dateStr, status: 'CONFIRMED' });
      mockService.createAlert({ type: 'INFO', message: `Te agregaron a la clase "${classData.name}" del día ${dateStr.split('-').reverse().join('-')} (${classData.time}). Se ha descontado 1 crédito.`, studentId });
      Promise.all([
        mockService.getBookings().then(setBookings),
        mockService.getAlerts().then(setAlerts),
        mockService.getStudentProfiles().then(setStudentProfiles),
      ]);
      return newBooking;
    } catch (err) {
      setBookings(prev => prev.filter(b => b.id !== optimisticId));
      setStudentProfiles(prev => prev.map(p =>
        p.studentId === studentId ? { ...p, classCredits: p.classCredits + 1 } : p
      ));
      throw err;
    }
  };

  // 2. Cancelar reserva — Optimistic UI
  const cancelBooking = async (bookingId, forceLate = false, forceRefund = false) => {
    const prevBookings = bookings;
    const prevProfiles = studentProfiles;
    // Optimistic: marcar como cancelada inmediatamente
    const newStatus = forceLate ? 'CANCELLED_LATE' : 'CANCELLED';
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));

    try {
      const response = await mockService.updateBooking(bookingId, {
        status: forceLate ? 'CANCELLED_LATE' : forceRefund ? 'CANCELLED_REFUND' : 'CANCELLED'
      });
      // Re-fetch silencioso
      Promise.all([
        mockService.getBookings().then(setBookings),
        mockService.getStudentProfiles().then(setStudentProfiles),
        mockService.getAlerts().then(setAlerts),
      ]);
      return { isLateCancellation: response.isLateCancellation };
    } catch (error) {
      setBookings(prevBookings);
      setStudentProfiles(prevProfiles);
      console.error('Error al cancelar reserva:', error);
      throw error;
    }
  };

  const rescheduleBooking = async (bookingId, newClassId, newDateStr) => {
    const prevBookings = bookings;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, classId: newClassId, date: newDateStr } : b));
    try {
      await mockService.rescheduleBooking(bookingId, newClassId, newDateStr);
      Promise.all([
        mockService.getBookings().then(setBookings),
        mockService.getAlerts().then(setAlerts),
        mockService.getStudentProfiles().then(setStudentProfiles),
        mockService.getWaitlist().catch(() => []).then(setWaitlist),
      ]);
      return true;
    } catch (err) {
      setBookings(prevBookings);
      throw err;
    }
  };

  // Agregar a la lista de espera — Optimistic UI
  const joinWaitlistAction = async (classId, dateStr) => {
    const studentId = currentUser.id;
    const optimisticEntry = { id: `optimistic-${Date.now()}`, studentId, classId, date: dateStr };
    setWaitlist(prev => [...prev, optimisticEntry]);
    try {
      await mockService.joinWaitlist({ studentId, classId, date: dateStr });
      mockService.getWaitlist().catch(() => []).then(setWaitlist);
    } catch (err) {
      setWaitlist(prev => prev.filter(w => w.id !== optimisticEntry.id));
      throw err;
    }
  };

  // 3. Tomar asistencia — Optimistic UI
  const takeAttendance = async (bookingId, attendanceStatus) => {
    const prevBookings = bookings;
    const prevProfiles = studentProfiles;
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Reserva no encontrada");
    const studentId = booking.studentId;
    const profile = studentProfiles.find(p => p.studentId === studentId);
    if (!profile) throw new Error("Perfil de estudiante no encontrado");

    // Optimistic
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: attendanceStatus } : b));
    if (attendanceStatus === 'ATTENDED' && booking.status !== 'ATTENDED') {
      setStudentProfiles(prev => prev.map(p =>
        p.studentId === studentId ? { ...p, classCredits: Math.max(0, p.classCredits - 1) } : p
      ));
    }

    try {
      if (attendanceStatus === 'ATTENDED') {
        if (booking.status !== 'ATTENDED') {
          const newCredits = Math.max(0, profile.classCredits - 1);
          await mockService.updateStudentProfile(studentId, { classCredits: newCredits });
        }
        await mockService.updateBooking(bookingId, { status: 'ATTENDED' });
      } else if (attendanceStatus === 'ABSENT') {
        await mockService.updateBooking(bookingId, { status: 'ABSENT' });
      }
      Promise.all([
        mockService.getBookings().then(setBookings),
        mockService.getStudentProfiles().then(setStudentProfiles),
      ]);
    } catch (err) {
      setBookings(prevBookings);
      setStudentProfiles(prevProfiles);
      throw err;
    }
  };

  // 4. Entrega de arcilla — Optimistic UI
  const deliverClayToStudent = async (studentId, studentName, teacherId, teacherName) => {
    const profile = studentProfiles.find(p => p.studentId === studentId);
    if (!profile) throw new Error("Perfil de estudiante no encontrado");
    if (profile.monthlyClayKg >= 1.0) {
      mockService.createAlert({ type: 'CLAY_LIMIT', message: `El alumno ${studentName} intentó retirar otro bloque de arcilla de 1kg en este mes, pero ya alcanzó su límite mensual.` })
        .then(() => mockService.getAlerts().then(setAlerts));
      throw new Error("Límite mensual de arcilla alcanzado (1kg por mes). No se puede entregar más arcilla.");
    }
    const todayStr = new Date().toISOString().split('T')[0];
    // Optimistic
    setStudentProfiles(prev => prev.map(p =>
      p.studentId === studentId ? { ...p, monthlyClayKg: p.monthlyClayKg + 1.0, lastClayDeliveryDate: todayStr } : p
    ));
    const prevProfiles = studentProfiles;
    try {
      await mockService.createClayDelivery({ studentId, studentName, teacherId, teacherName, date: todayStr, quantityKg: 1.0 });
      await mockService.updateStudentProfile(studentId, { monthlyClayKg: profile.monthlyClayKg + 1.0, lastClayDeliveryDate: todayStr });
      Promise.all([
        mockService.getStudentProfiles().then(setStudentProfiles),
        mockService.getClayDeliveries().then(setClayDeliveries),
      ]);
    } catch (err) {
      setStudentProfiles(prevProfiles);
      throw err;
    }
  };

  // 5. Registrar pago manual — background
  const recordStudentPayment = async (studentIds, amount, creditsToAdd, paymentDate) => {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error("Debe seleccionar al menos un estudiante");
    }
    await mockService.recordStudentPayment(studentIds, amount, creditsToAdd, paymentDate);
    Promise.all([
      mockService.getStudentProfiles().then(setStudentProfiles),
      mockService.getPayments().then(setPayments),
    ]);
  };

  const confirmPendingPayment = async (paymentId, confirmationDate) => {
    const prevPayments = payments;
    const prevProfiles = studentProfiles;
    // Optimistic: marcar el pago como PAID
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'PAID' } : p));
    try {
      await mockService.confirmPayment(paymentId, confirmationDate);
      Promise.all([
        mockService.getStudentProfiles().then(setStudentProfiles),
        mockService.getPayments().then(setPayments),
      ]);
    } catch (err) {
      setPayments(prevPayments);
      setStudentProfiles(prevProfiles);
      throw err;
    }
  };

  const confirmInsumoPayment = async (insumoId) => {
    const prevBakes = bakes;
    setBakes(prev => prev.map(b => b.id === insumoId ? { ...b, bl_pagado: true } : b));
    try {
      await mockService.confirmInsumoPayment(insumoId);
      mockService.getBakes().then(setBakes);
    } catch (err) {
      setBakes(prevBakes);
      throw err;
    }
  };

  const sendTransferReminder = async (paymentId) => {
    await mockService.notifyPaymentReminder(paymentId);
  };

  const requestStudentPayment = async (studentId, amount, creditsToAdd) => {
    await mockService.requestPayment({ studentId, amount, classCreditsAdded: creditsToAdd });
    mockService.getPayments().then(setPayments);
  };

  // 6. Crear nuevo turno — background
  const createNewTurn = async (classData, repeatDays) => {
    const generatedClasses = [];
    if (repeatDays && repeatDays.length > 0) {
      for (const day of repeatDays) {
        const newCls = await mockService.createClass({ name: classData.name, teacherIds: classData.teacherIds, teacherName: classData.teacherName, day, time: classData.time, capacity: classData.capacity, sucursal: classData.sucursal });
        generatedClasses.push(newCls);
      }
    } else {
      const newCls = await mockService.createClass({ name: classData.name, teacherIds: classData.teacherIds, teacherName: classData.teacherName, day: classData.day, time: classData.time, capacity: classData.capacity, sucursal: classData.sucursal });
      generatedClasses.push(newCls);
    }
    mockService.getClasses().then(setClasses);
    return generatedClasses;
  };

  const changeClassTeacher = async (classId, teacherId) => {
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, teacherId } : c));
    await mockService.updateClassTeacher(classId, teacherId);
    mockService.getClasses().then(setClasses);
  };

  const updateTurn = async (classId, classData) => {
    await mockService.updateClass(classId, classData);
    mockService.getClasses().then(setClasses);
  };

  const deleteTurn = async (classId) => {
    setClasses(prev => prev.filter(c => c.id !== classId));
    await mockService.deleteClass(classId);
    mockService.getClasses().then(setClasses);
  };

  const toggleClassPauseAction = async (classId, dateStr, isPaused) => {
    await mockService.toggleClassPause(classId, dateStr, isPaused);
    Promise.all([
      mockService.getClasses().then(setClasses),
      mockService.getBookings().then(setBookings),
      mockService.getStudentProfiles().then(setStudentProfiles),
    ]);
  };

  const bulkAssignClasses = async (teacherId, classIds) => {
    await mockService.bulkAssignClassesToTeacher(teacherId, classIds);
    mockService.getClasses().then(setClasses);
  };

  const createBake = async (bakeData) => {
    await mockService.createBake(bakeData);
    mockService.getBakes().then(setBakes);
  };

  const createExtraClay = async (clayData) => {
    await mockService.createExtraClay(clayData);
    mockService.getBakes().then(setBakes);
  };

  // 7. Crear usuario — background
  const createNewUserAction = async (userData) => {
    const newUser = await mockService.createUser(userData);
    Promise.all([
      mockService.getUsers().then(setUsers),
      mockService.getStudentProfiles().then(setStudentProfiles),
    ]);
    return newUser;
  };

  const resendWelcomeEmailsAction = async (studentIds) => {
    const result = await mockService.resendWelcomeEmails(studentIds);
    mockService.getUsers().then(setUsers);
    return result;
  };

  const updateUserAction = async (userId, userData) => {
    const updatedUser = await mockService.updateUser(userId, userData);
    if (currentUser && currentUser.id === userId) setCurrentUser(updatedUser);
    Promise.all([
      mockService.getUsers().then(setUsers),
      mockService.getStudentProfiles().then(setStudentProfiles),
    ]);
    return updatedUser;
  };

  const updateUserPasswordAction = async (userId, currentPassword, newPassword) => {
    await mockService.updateUserPassword(userId, currentPassword, newPassword);
    return true;
  };

  const deleteUserAction = async (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setStudentProfiles(prev => prev.filter(p => p.studentId !== userId));
    await mockService.deleteUser(userId);
    Promise.all([
      mockService.getUsers().then(setUsers),
      mockService.getStudentProfiles().then(setStudentProfiles),
    ]);
  };

  const toggleStudentBlockAction = async (studentId, isBlocked) => {
    setStudentProfiles(prev => prev.map(p =>
      p.studentId === studentId ? { ...p, isBlocked } : p
    ));
    await mockService.toggleStudentBlock(studentId, isBlocked);
    mockService.getStudentProfiles().then(setStudentProfiles);
  };

  const requestClassPauseAction = async (classId, className, dateStr, teacherName) => {
    await mockService.createAlert({
      type: 'PAUSE_REQUEST',
      message: `El profesor/a ${teacherName} solicitó pausar la clase "${className}" del día ${dateStr.split('-').reverse().join('/')}.`,
      metadata: { classId, className, dateStr, teacherName }
    });
    mockService.getAlerts().then(setAlerts);
  };

  const handlePauseRequestAction = async (alertId, accept, metadata) => {
    // Optimistic: quitar la alerta de la lista
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    try {
      if (accept && metadata) {
        await mockService.toggleClassPause(metadata.classId, metadata.dateStr, true);
      }
      await mockService.resolveAlert(alertId);
      const refreshes = [mockService.getAlerts().then(setAlerts)];
      if (accept) refreshes.push(mockService.getClasses().then(setClasses));
      Promise.all(refreshes);
    } catch (err) {
      mockService.getAlerts().then(setAlerts); // restaurar en caso de error
      throw err;
    }
  };

  // 8. Alertas — Optimistic UI
  const resolveAlertAction = async (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    await mockService.resolveAlert(alertId);
    mockService.getAlerts().then(setAlerts);
  };

  const resolveAllAlertsAction = async (alertIds) => {
    setAlerts(prev => prev.filter(a => !alertIds.includes(a.id)));
    try {
      await Promise.all(alertIds.map(id => mockService.resolveAlert(id)));
      mockService.getAlerts().then(setAlerts);
    } catch (error) {
      console.error("Error al resolver alertas:", error);
      mockService.getAlerts().then(setAlerts); // restaurar
    }
  };

  // 9. Días no laborales — background
  const addNonWorkingDay = async (fecha, motivo) => {
    await mockService.addNonWorkingDay(fecha, motivo);
    mockService.getNonWorkingDays().then(setNonWorkingDays);
  };

  const deleteNonWorkingDay = async (fecha) => {
    setNonWorkingDays(prev => prev.filter(d => d.fecha !== fecha));
    await mockService.deleteNonWorkingDay(fecha);
    mockService.getNonWorkingDays().then(setNonWorkingDays);
  };

  // Packs — background
  const createPack = async (packData) => {
    await mockService.createPack(packData);
    mockService.getPacks().then(setPacks);
  };

  const updatePack = async (packId, packData) => {
    await mockService.updatePack(packId, packData);
    mockService.getPacks().then(setPacks);
  };

  const deletePack = async (packId) => {
    setPacks(prev => prev.filter(p => p.id !== packId));
    try {
      await mockService.deletePack(packId);
      mockService.getPacks().then(setPacks);
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      mockService.getPacks().then(setPacks); // restaurar
      throw error;
    }
  };

  // --- Extras ---
  const reloadExtras = async () => {
    try {
      const loadedExtras = await mockService.getExtras();
      setExtras(loadedExtras);
    } catch (error) {
      console.error('Error al recargar extras:', error);
    }
  };

  const createExtra = async (extraData) => {
    try {
      await mockService.createExtra(extraData);
      await reloadExtras();
    } catch (error) {
      console.error('Error al crear extra:', error);
      throw error;
    }
  };

  const updateExtra = async (extraId, extraData) => {
    try {
      await mockService.updateExtra(extraId, extraData);
      await reloadExtras();
    } catch (error) {
      console.error('Error al actualizar extra:', error);
      throw error;
    }
  };

  const deleteExtra = async (extraId) => {
    try {
      await mockService.deleteExtra(extraId);
      await reloadExtras();
    } finally {
      setLoading(false);
    }
  };

  // FAQs — background
  const createFaq = async (faq) => {
    await mockService.createFaq(faq);
    mockService.getFaqs().then(setFaqs);
  };
  const updateFaq = async (id, data) => {
    await mockService.updateFaq(id, data);
    mockService.getFaqs().then(setFaqs);
  };
  const deleteFaq = async (id) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    await mockService.deleteFaq(id);
    mockService.getFaqs().then(setFaqs);
  };

  // Branches — background
  const createBranch = async (branch) => {
    await mockService.createBranch(branch);
    mockService.getBranches().then(setBranches);
  };
  const updateBranch = async (id, data) => {
    await mockService.updateBranch(id, data);
    mockService.getBranches().then(setBranches);
  };
  const deleteBranch = async (id) => {
    setBranches(prev => prev.filter(b => b.id !== id));
    await mockService.deleteBranch(id);
    mockService.getBranches().then(setBranches);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users,
        studentProfiles,
        classes,
        bookings,
        clayDeliveries,
        bakes,
        payments,
        alerts,
        waitlist,
        nonWorkingDays,
        packs,
        extras,
        branches,
        faqs,
        loading,
        loginAction,
        forgotPasswordAction,
        logoutAction,
        changeUserRole,
        updateUserSecondaryRole,
        switchProfile,
        changeUser,
        resetDatabase,
        // Student Actions
        bookClass,
        bookClassForStudent,
        createExtraClay,
        cancelBooking,
        rescheduleBooking,
        joinWaitlistAction,
        takeAttendance,
        deliverClayToStudent,
        createBake,
        recordStudentPayment,
        confirmPendingPayment,
        confirmInsumoPayment,
        sendTransferReminder,
        requestStudentPayment,
        createNewTurn,
        changeClassTeacher,
        updateTurn,
        deleteTurn,
        toggleClassPauseAction,
        bulkAssignClasses,
        createNewUserAction,
        updateUserAction,
        updateUserPasswordAction,
        resendWelcomeEmailsAction,
        deleteUserAction,
        toggleStudentBlockAction,
        requestClassPauseAction,
        handlePauseRequestAction,
        resolveAlertAction,
        resolveAllAlertsAction,
        addNonWorkingDay,
        deleteNonWorkingDay,
        createPack,
        updatePack,
        deletePack,
        createExtra,
        updateExtra,
        deleteExtra,
        createFaq,
        updateFaq,
        deleteFaq,
        createBranch,
        updateBranch,
        deleteBranch,
        reloadAllData: loadData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
