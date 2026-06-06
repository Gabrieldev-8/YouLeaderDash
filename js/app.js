// ========================================
// YOULEADER - SISTEMA TRES ROLES
// Trabajador | Supervisor | RRHH
// CORREGIDO - Validación de estrellas funcionando
// ========================================

// ========== ESTRUCTURA DE DATOS ==========
let allMoodEntries = [];
let allRecognitions = [];
let allFeedbacks = [];

let currentUser = null;
let currentRole = null;

// Mapeo de estados de ánimo a valores
const moodMap = {
  'excelente': { value: 5, emoji: '🤩', label: 'Excelente', color: '#10B981' },
  'bien': { value: 4, emoji: '😊', label: 'Bien', color: '#3B82F6' },
  'neutral': { value: 3, emoji: '😐', label: 'Neutral', color: '#F59E0B' },
  'estresado': { value: 2, emoji: '😫', label: 'Estresado', color: '#F97316' },
  'mal': { value: 1, emoji: '😔', label: 'Mal', color: '#EF4444' }
};

// ========== INICIALIZACIÓN ==========
function init() {
  loadData();
  
  const path = window.location.pathname;
  
  if (path.includes('dashboard-rrhh.html')) {
    checkAuth(['rrhh']);
    setupRRHHDashboard();
  } else if (path.includes('dashboard-supervisor.html')) {
    checkAuth(['supervisor']);
    setupSupervisorDashboard();
  } else if (path.includes('dashboard-trabajador.html')) {
    checkAuth(['trabajador']);
    setupTrabajadorDashboard();
  } else {
    setupLogin();
  }
}

// ========== CARGA DE DATOS ==========
function loadData() {
  const savedMoods = localStorage.getItem('youleader_mood_entries');
  const savedRecognitions = localStorage.getItem('youleader_recognitions_v2');
  const savedFeedbacks = localStorage.getItem('youleader_feedbacks_v2');
  
  if (savedMoods) {
    allMoodEntries = JSON.parse(savedMoods);
  } else {
    const today = new Date();
    allMoodEntries = [
      { id: 1, userName: "Ana G.", userTeam: "Ventas", mood: "bien", motivation: 4, note: "Buen ambiente hoy, aunque con algo de presión", date: new Date(today - 86400000).toISOString() },
      { id: 2, userName: "Carlos R.", userTeam: "Soporte", mood: "neutral", motivation: 3, note: "Día normal, mucho trabajo", date: new Date(today - 86400000).toISOString() },
      { id: 3, userName: "María L.", userTeam: "Ventas", mood: "excelente", motivation: 5, note: "¡Me siento muy motivada! Excelente liderazgo", date: new Date(today - 172800000).toISOString() },
      { id: 4, userName: "Pedro M.", userTeam: "Retencion", mood: "estresado", motivation: 2, note: "Mucha presión, necesito apoyo", date: new Date(today - 86400000).toISOString() }
    ];
    saveMoods();
  }
  
  if (savedRecognitions) {
    allRecognitions = JSON.parse(savedRecognitions);
  } else {
    allRecognitions = [
      { id: 1, userName: "Ana G.", recognizedTo: "Líder de Ventas", message: "Siempre está disponible para ayudarnos", date: new Date(Date.now() - 7200000).toISOString() },
      { id: 2, userName: "Carlos R.", recognizedTo: "Compañero Pedro", message: "Gran compañerismo en momentos difíciles", date: new Date(Date.now() - 18000000).toISOString() }
    ];
    saveRecognitions();
  }
  
  if (savedFeedbacks) {
    allFeedbacks = JSON.parse(savedFeedbacks);
  } else {
    allFeedbacks = [
      { id: 1, userName: "Ana G.", userTeam: "Ventas", motivacion: 4, empatia: 5, comunicacion: 4, reconocimiento: 4, date: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, userName: "Carlos R.", userTeam: "Soporte", motivacion: 3, empatia: 4, comunicacion: 3, reconocimiento: 4, date: new Date(Date.now() - 172800000).toISOString() }
    ];
    saveFeedbacks();
  }
}

function saveMoods() {
  localStorage.setItem('youleader_mood_entries', JSON.stringify(allMoodEntries));
}

function saveRecognitions() {
  localStorage.setItem('youleader_recognitions_v2', JSON.stringify(allRecognitions));
}

function saveFeedbacks() {
  localStorage.setItem('youleader_feedbacks_v2', JSON.stringify(allFeedbacks));
}

// ========== LOGIN ==========
function setupLogin() {
  const roleBtns = document.querySelectorAll('.role-btn');
  const loginForm = document.getElementById('loginForm');
  const formTitle = document.getElementById('formTitle');
  const teamGroup = document.getElementById('teamGroup');
  const loginBtn = document.getElementById('loginBtn');
  
  let selectedRole = null;
  
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRole = btn.getAttribute('data-role');
      
      if (selectedRole === 'rrhh') {
        formTitle.textContent = 'Ingresa como Recursos Humanos';
        teamGroup.style.display = 'none';
      } else if (selectedRole === 'supervisor') {
        formTitle.textContent = 'Ingresa como Supervisor';
        teamGroup.style.display = 'block';
      } else {
        formTitle.textContent = 'Ingresa como Colaborador';
        teamGroup.style.display = 'block';
      }
      
      loginForm.style.display = 'block';
    });
  });
  
  loginBtn.addEventListener('click', () => {
    const userName = document.getElementById('userName').value.trim();
    const userTeam = document.getElementById('userTeam')?.value;
    
    if (!userName) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    
    if (selectedRole !== 'rrhh' && (!userTeam || userTeam === '')) {
      alert('Por favor selecciona tu equipo');
      return;
    }
    
    currentUser = {
      name: userName,
      team: selectedRole === 'rrhh' ? 'RRHH' : userTeam,
      role: selectedRole
    };
    
    localStorage.setItem('youleader_current_user', JSON.stringify(currentUser));
    
    if (selectedRole === 'trabajador') {
      window.location.href = 'dashboard-trabajador.html';
    } else if (selectedRole === 'supervisor') {
      window.location.href = 'dashboard-supervisor.html';
    } else {
      window.location.href = 'dashboard-rrhh.html';
    }
  });
}

function checkAuth(allowedRoles) {
  const savedUser = localStorage.getItem('youleader_current_user');
  if (!savedUser) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(savedUser);
  currentRole = currentUser.role;
  
  if (!allowedRoles.includes(currentRole)) {
    window.location.href = 'index.html';
    return;
  }
  
  const userNameSpan = document.getElementById('userNameDisplay');
  const userTeamSpan = document.getElementById('userTeamDisplay');
  if (userNameSpan) userNameSpan.textContent = currentUser.name;
  if (userTeamSpan && currentUser.team && currentUser.team !== 'RRHH') {
    userTeamSpan.textContent = currentUser.team;
  } else if (userTeamSpan) {
    userTeamSpan.style.display = 'none';
  }
}

// ========== DASHBOARD TRABAJADOR ==========
function setupTrabajadorDashboard() {
  document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
  document.getElementById('userNameDisplay').textContent = currentUser.name;
  document.getElementById('userTeamDisplay').textContent = currentUser.team;
  
  setupMoodSelector();
  setupMotivationStars();
  loadRecognitionsForTrabajador();
  loadMyMoodHistory();
  
  document.getElementById('submitMoodBtn').addEventListener('click', submitMoodEntry);
  document.getElementById('sendRecognitionBtn').addEventListener('click', submitRecognitionTrabajador);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function setupMoodSelector() {
  const moodOptions = document.querySelectorAll('.mood-option');
  moodOptions.forEach(option => {
    option.addEventListener('click', () => {
      moodOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
}

// FUNCIÓN CORREGIDA - Setup de estrellas de motivación
function setupMotivationStars() {
  const starsContainer = document.getElementById('motivationStars');
  if (!starsContainer) return;
  
  const stars = starsContainer.querySelectorAll('i');
  
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const value = parseInt(this.getAttribute('data-value'));
      
      // Limpiar todas las estrellas
      stars.forEach(s => {
        s.classList.remove('active');
        s.className = 'far fa-star';
      });
      
      // Activar estrellas hasta el valor seleccionado
      for (let i = 0; i < value; i++) {
        stars[i].classList.add('active');
        stars[i].className = 'fas fa-star';
      }
      
      // Guardar el valor seleccionado en un atributo data del contenedor
      starsContainer.setAttribute('data-selected-value', value);
    });
  });
}

// FUNCIÓN CORREGIDA - Obtener valor de motivación
function getMotivationValue() {
  const starsContainer = document.getElementById('motivationStars');
  if (!starsContainer) return 0;
  
  // Método 1: Leer del atributo data
  let selectedValue = starsContainer.getAttribute('data-selected-value');
  if (selectedValue) return parseInt(selectedValue);
  
  // Método 2: Contar estrellas activas
  const activeStars = starsContainer.querySelectorAll('i.active');
  if (activeStars.length > 0) return activeStars.length;
  
  return 0;
}

function submitMoodEntry() {
  // Validar estado de ánimo seleccionado
  const selectedMood = document.querySelector('.mood-option.selected');
  if (!selectedMood) {
    showToast('😊 Por favor selecciona cómo te sientes hoy', 'error');
    return;
  }
  
  // Validar motivación (estrellas) - FUNCIÓN CORREGIDA
  const motivationValue = getMotivationValue();
  if (motivationValue === 0) {
    showToast('⭐ Por favor califica tu nivel de motivación (1-5 estrellas)', 'error');
    return;
  }
  
  const mood = selectedMood.getAttribute('data-mood');
  const note = document.getElementById('dailyNote').value.trim();
  
  // Verificar si ya registró hoy
  const today = new Date().toDateString();
  const alreadyRegistered = allMoodEntries.some(entry => 
    entry.userName === currentUser.name && 
    new Date(entry.date).toDateString() === today
  );
  
  if (alreadyRegistered) {
    showToast('📅 Ya registraste tu estado de ánimo hoy. Puedes actualizarlo mañana.', 'error');
    return;
  }
  
  const newEntry = {
    id: Date.now(),
    userName: currentUser.name,
    userTeam: currentUser.team,
    mood: mood,
    motivation: motivationValue,
    note: note || '',
    date: new Date().toISOString()
  };
  
  allMoodEntries.unshift(newEntry);
  saveMoods();
  
  // Limpiar formulario
  document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
  
  // Limpiar estrellas
  const starsContainer = document.getElementById('motivationStars');
  if (starsContainer) {
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach(star => {
      star.classList.remove('active');
      star.className = 'far fa-star';
    });
    starsContainer.removeAttribute('data-selected-value');
  }
  
  document.getElementById('dailyNote').value = '';
  
  showToast('✅ ¡Gracias! Tu estado de ánimo ha sido registrado', 'success');
  loadMyMoodHistory();
}

function submitRecognitionTrabajador() {
  const name = document.getElementById('recogName').value.trim();
  const recognizedTo = document.getElementById('recogTo').value.trim();
  const message = document.getElementById('recogMessage').value.trim();
  
  if (!recognizedTo || !message) {
    showToast('Por favor completa a quién reconoces y el mensaje', 'error');
    return;
  }
  
  const newRecognition = {
    id: Date.now(),
    userName: name || 'Anónimo',
    recognizedTo: recognizedTo,
    message: message,
    date: new Date().toISOString()
  };
  
  allRecognitions.unshift(newRecognition);
  saveRecognitions();
  
  document.getElementById('recogName').value = '';
  document.getElementById('recogTo').value = '';
  document.getElementById('recogMessage').value = '';
  
  showToast('🏆 ¡Reconocimiento publicado!', 'success');
  loadRecognitionsForTrabajador();
}

function loadRecognitionsForTrabajador() {
  const container = document.getElementById('recognitionList');
  if (!container) return;
  
  if (allRecognitions.length === 0) {
    container.innerHTML = '<div class="empty-state">Aún no hay reconocimientos. ¡Sé el primero!</div>';
    return;
  }
  
  const sorted = [...allRecognitions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  container.innerHTML = sorted.map(r => `
    <div class="recognition-item">
      <strong>${escapeHtml(r.userName)}</strong> → <span style="color:var(--primary)">${escapeHtml(r.recognizedTo)}</span>
      <p>${escapeHtml(r.message)}</p>
      <small>${formatDate(r.date)}</small>
    </div>
  `).join('');
}

function loadMyMoodHistory() {
  const container = document.getElementById('myMoodHistory');
  if (!container) return;
  
  const myEntries = allMoodEntries.filter(e => e.userName === currentUser.name).slice(0, 10);
  
  if (myEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">Aún no has registrado tu estado de ánimo</div>';
    return;
  }
  
  container.innerHTML = myEntries.map(entry => `
    <div class="history-item">
      <div class="history-date">${formatDate(entry.date)}</div>
      <div class="history-mood">
        <span>${moodMap[entry.mood]?.emoji || '😐'}</span>
        <span>${moodMap[entry.mood]?.label || 'Neutral'}</span>
        <span>⭐ ${entry.motivation}/5</span>
      </div>
      ${entry.note ? `<div class="history-note">💬 ${escapeHtml(entry.note)}</div>` : ''}
    </div>
  `).join('');
}

// ========== DASHBOARD SUPERVISOR ==========
function setupSupervisorDashboard() {
  document.getElementById('userNameDisplay').textContent = currentUser.name;
  document.getElementById('userTeamDisplay').textContent = currentUser.team;
  
  updateSupervisorDashboard();
  setInterval(updateSupervisorDashboard, 30000);
  
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function updateSupervisorDashboard() {
  const teamMoods = allMoodEntries.filter(m => m.userTeam === currentUser.team);
  const teamFeedbacks = allFeedbacks.filter(f => f.userTeam === currentUser.team);
  
  const avgMotivation = teamMoods.length > 0 
    ? Math.round(teamMoods.reduce((sum, m) => sum + m.motivation, 0) / teamMoods.length * 20)
    : 0;
  
  const climaGeneral = avgMotivation;
  
  const today = new Date().toDateString();
  const todayMoods = teamMoods.filter(m => new Date(m.date).toDateString() === today);
  const moodCounts = { excelente: 0, bien: 0, neutral: 0, estresado: 0, mal: 0 };
  todayMoods.forEach(m => { if (moodCounts[m.mood] !== undefined) moodCounts[m.mood]++; });
  
  const leadership = calculateLeadershipMetrics(teamFeedbacks);
  
  const alerts = [];
  if (avgMotivation < 50) alerts.push({ type: 'motivacion', message: `⚠️ Motivación baja (${avgMotivation}%). Programa acciones de reconocimiento.` });
  if (todayMoods.filter(m => m.mood === 'estresado' || m.mood === 'mal').length > teamMoods.length * 0.3 && teamMoods.length > 0) {
    alerts.push({ type: 'estres', message: '⚠️ Más del 30% del equipo reporta estrés o malestar. Reúnete con ellos.' });
  }
  if (teamMoods.length < 5) alerts.push({ type: 'participacion', message: '📊 Baja participación en registros de estado de ánimo.' });
  
  document.getElementById('climaValue').textContent = climaGeneral + '%';
  document.getElementById('motivacionValue').textContent = avgMotivation + '%';
  document.getElementById('alertasCount').textContent = alerts.length;
  document.getElementById('recogCount').textContent = allRecognitions.length;
  document.getElementById('participacionCount').innerHTML = `${teamMoods.length} registros`;
  
  const insight = climaGeneral >= 70 ? `🎉 ¡Excelente! Tu equipo tiene un clima del ${climaGeneral}%. Sigue fomentando el reconocimiento.` :
                  climaGeneral >= 50 ? `📈 Buen trabajo. El clima está en ${climaGeneral}%. Identifica áreas de mejora.` :
                  `⚠️ Atención: El clima está en ${climaGeneral}%. Agenda reuniones de feedback.`;
  document.getElementById('insightText').textContent = insight;
  
  renderMoodDistribution(moodCounts, teamMoods.length);
  renderWeeklyTrend(teamMoods);
  
  document.getElementById('empatiaFill').style.width = leadership.empatia + '%';
  document.getElementById('empatiaValue').textContent = leadership.empatia + '%';
  document.getElementById('comunicacionFill').style.width = leadership.comunicacion + '%';
  document.getElementById('comunicacionValue').textContent = leadership.comunicacion + '%';
  document.getElementById('reconocimientoFill').style.width = leadership.reconocimiento + '%';
  document.getElementById('reconocimientoValue').textContent = leadership.reconocimiento + '%';
  
  renderTeamNotes(teamMoods);
  renderAlertsSupervisor(alerts);
}

function calculateLeadershipMetrics(feedbacks) {
  if (feedbacks.length === 0) return { empatia: 0, comunicacion: 0, reconocimiento: 0 };
  const sum = feedbacks.reduce((acc, f) => {
    acc.empatia += f.empatia;
    acc.comunicacion += f.comunicacion;
    acc.reconocimiento += f.reconocimiento;
    return acc;
  }, { empatia: 0, comunicacion: 0, reconocimiento: 0 });
  const count = feedbacks.length;
  return {
    empatia: Math.round((sum.empatia / count) * 20),
    comunicacion: Math.round((sum.comunicacion / count) * 20),
    reconocimiento: Math.round((sum.reconocimiento / count) * 20)
  };
}

function renderMoodDistribution(moodCounts, total) {
  const container = document.getElementById('moodDistribution');
  if (!container) return;
  
  const moods = ['excelente', 'bien', 'neutral', 'estresado', 'mal'];
  container.innerHTML = moods.map(mood => {
    const count = moodCounts[mood];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="mood-bar">
        <div class="mood-bar-label">${moodMap[mood].emoji} ${moodMap[mood].label}</div>
        <div class="mood-bar-bg">
          <div class="mood-bar-fill fill-${mood}" style="width: ${percentage}%">${percentage}%</div>
        </div>
        <span>${count}</span>
      </div>
    `;
  }).join('');
}

function renderWeeklyTrend(teamMoods) {
  const container = document.getElementById('weeklyTrend');
  if (!container) return;
  
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  const weekData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayStr = date.toDateString();
    const dayMoods = teamMoods.filter(m => new Date(m.date).toDateString() === dayStr);
    const avgMotivation = dayMoods.length > 0 
      ? Math.round(dayMoods.reduce((sum, m) => sum + m.motivation, 0) / dayMoods.length * 20)
      : 0;
    weekData.push({ day: days[date.getDay() === 0 ? 6 : date.getDay() - 1], value: avgMotivation, count: dayMoods.length });
  }
  
  const maxHeight = 150;
  container.innerHTML = weekData.map(d => `
    <div class="trend-bar-container">
      <div class="trend-bar" style="height: ${(d.value / 100) * maxHeight}px"></div>
      <div class="trend-label">${d.day}</div>
      <div class="trend-value">${d.value}%</div>
    </div>
  `).join('');
}

function renderTeamNotes(teamMoods) {
  const container = document.getElementById('teamNotesList');
  if (!container) return;
  
  const notes = teamMoods.filter(m => m.note && m.note.trim() !== '').slice(0, 15);
  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state">Aún no hay notas de los colaboradores</div>';
    return;
  }
  
  container.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="note-header">
        <span>👤 ${escapeHtml(n.userName)}</span>
        <span>${formatDate(n.date)}</span>
      </div>
      <div class="note-content">💬 "${escapeHtml(n.note)}"</div>
      <div class="note-mood">${moodMap[n.mood]?.emoji} ${moodMap[n.mood]?.label} | ⭐ ${n.motivation}/5</div>
    </div>
  `).join('');
}

function renderAlertsSupervisor(alerts) {
  const container = document.getElementById('alertsList');
  if (!container) return;
  
  if (alerts.length === 0) {
    container.innerHTML = '<div class="alert-placeholder">🟢 Sin alertas activas. Todo en orden.</div>';
    return;
  }
  
  container.innerHTML = alerts.map(alert => `
    <div class="alert-item">
      <i class="fas fa-exclamation-circle"></i>
      <div>${alert.message}</div>
    </div>
  `).join('');
}

// ========== DASHBOARD RRHH ==========
function setupRRHHDashboard() {
  document.getElementById('userNameDisplay').textContent = currentUser.name;
  
  updateRRHHDashboard();
  
  document.getElementById('periodFilter').addEventListener('change', updateRRHHDashboard);
  document.getElementById('teamFilter').addEventListener('change', updateRRHHDashboard);
  document.getElementById('refreshBtn').addEventListener('click', updateRRHHDashboard);
  document.getElementById('exportResumenBtn').addEventListener('click', exportResumen);
  document.getElementById('exportDetalleBtn').addEventListener('click', exportDetalle);
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function updateRRHHDashboard() {
  const period = document.getElementById('periodFilter').value;
  const teamFilter = document.getElementById('teamFilter').value;
  
  let filteredMoods = [...allMoodEntries];
  let filteredFeedbacks = [...allFeedbacks];
  
  const now = new Date();
  if (period === 'hoy') {
    const today = now.toDateString();
    filteredMoods = filteredMoods.filter(m => new Date(m.date).toDateString() === today);
  } else if (period === 'semana') {
    const weekAgo = new Date(now - 7 * 86400000);
    filteredMoods = filteredMoods.filter(m => new Date(m.date) >= weekAgo);
  } else if (period === 'mes') {
    const monthAgo = new Date(now - 30 * 86400000);
    filteredMoods = filteredMoods.filter(m => new Date(m.date) >= monthAgo);
  }
  
  if (teamFilter !== 'todos') {
    filteredMoods = filteredMoods.filter(m => m.userTeam === teamFilter);
    filteredFeedbacks = filteredFeedbacks.filter(f => f.userTeam === teamFilter);
  }
  
  const totalMoods = filteredMoods.length;
  const avgMotivation = totalMoods > 0 
    ? Math.round(filteredMoods.reduce((sum, m) => sum + m.motivation, 0) / totalMoods * 20)
    : 0;
  
  const leadership = calculateLeadershipMetrics(filteredFeedbacks);
  const climaGeneral = Math.round((avgMotivation + leadership.empatia + leadership.comunicacion + leadership.reconocimiento) / 4);
  
  const moodCounts = { excelente: 0, bien: 0, neutral: 0, estresado: 0, mal: 0 };
  filteredMoods.forEach(m => { if (moodCounts[m.mood] !== undefined) moodCounts[m.mood]++; });
  
  const teamAlerts = calculateTeamAlerts();
  
  document.getElementById('globalClima').textContent = climaGeneral + '%';
  document.getElementById('globalMotivacion').textContent = avgMotivation + '%';
  document.getElementById('globalAlertas').textContent = teamAlerts.filter(a => a.severity === 'alta').length;
  document.getElementById('globalRecog').textContent = allRecognitions.length;
  
  renderGlobalMoodDistribution(moodCounts, totalMoods);
  renderEvolutionChart(filteredMoods);
  renderTeamsComparison();
  renderAllNotes(filteredMoods);
  renderGlobalAlerts(teamAlerts);
}

function renderGlobalMoodDistribution(moodCounts, total) {
  const container = document.getElementById('globalMoodDistribution');
  if (!container) return;
  
  const moods = ['excelente', 'bien', 'neutral', 'estresado', 'mal'];
  container.innerHTML = moods.map(mood => {
    const count = moodCounts[mood];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="mood-bar">
        <div class="mood-bar-label" style="width: 120px">${moodMap[mood].emoji} ${moodMap[mood].label}</div>
        <div class="mood-bar-bg">
          <div class="mood-bar-fill fill-${mood}" style="width: ${percentage}%">${percentage}%</div>
        </div>
        <span style="width: 50px">${count}</span>
      </div>
    `;
  }).join('');
}

function renderEvolutionChart(filteredMoods) {
  const container = document.getElementById('evolutionChart');
  if (!container) return;
  
  const dayMap = new Map();
  filteredMoods.forEach(m => {
    const dateKey = new Date(m.date).toLocaleDateString();
    if (!dayMap.has(dateKey)) dayMap.set(dateKey, []);
    dayMap.get(dateKey).push(m.motivation);
  });
  
  const sortedDays = Array.from(dayMap.keys()).slice(-7);
  const chartData = sortedDays.map(day => {
    const motivations = dayMap.get(day);
    const avg = motivations.reduce((a,b) => a + b, 0) / motivations.length;
    return { day: day.substring(0, 5), value: Math.round(avg * 20) };
  });
  
  const maxHeight = 150;
  container.innerHTML = `
    <div class="weekly-trend">
      ${chartData.map(d => `
        <div class="trend-bar-container">
          <div class="trend-bar" style="height: ${(d.value / 100) * maxHeight}px"></div>
          <div class="trend-label">${d.day}</div>
          <div class="trend-value">${d.value}%</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTeamsComparison() {
  const container = document.getElementById('teamsComparison');
  if (!container) return;
  
  const teams = ['Ventas', 'Soporte', 'Retencion', 'Calidad', 'Operaciones'];
  const teamData = teams.map(team => {
    const teamMoods = allMoodEntries.filter(m => m.userTeam === team);
    const avgMotivation = teamMoods.length > 0 
      ? Math.round(teamMoods.reduce((sum, m) => sum + m.motivation, 0) / teamMoods.length * 20)
      : 0;
    return { team, value: avgMotivation, count: teamMoods.length };
  }).sort((a,b) => b.value - a.value);
  
  container.innerHTML = teamData.map(t => `
    <div class="team-row">
      <div class="team-name">${t.team}</div>
      <div class="team-bar">
        <div class="team-fill" style="width: ${t.value}%"></div>
      </div>
      <div class="team-value">${t.value}%</div>
      <div class="team-status ${t.value >= 70 ? 'status-good' : t.value >= 50 ? 'status-warning' : 'status-danger'}">
        ${t.value >= 70 ? '👍 Bueno' : t.value >= 50 ? '⚠️ Atención' : '🔴 Crítico'}
      </div>
    </div>
  `).join('');
}

function calculateTeamAlerts() {
  const teams = ['Ventas', 'Soporte', 'Retencion', 'Calidad', 'Operaciones'];
  const alerts = [];
  
  teams.forEach(team => {
    const teamMoods = allMoodEntries.filter(m => m.userTeam === team);
    const recentMoods = teamMoods.slice(0, 10);
    const avgMotivation = recentMoods.length > 0 
      ? Math.round(recentMoods.reduce((sum, m) => sum + m.motivation, 0) / recentMoods.length * 20)
      : 0;
    const stressCount = recentMoods.filter(m => m.mood === 'estresado' || m.mood === 'mal').length;
    const stressPercentage = recentMoods.length > 0 ? (stressCount / recentMoods.length) * 100 : 0;
    
    let severity = 'normal';
    let message = '';
    
    if (avgMotivation < 40) {
      severity = 'alta';
      message = `🔴 ${team}: Motivación muy baja (${avgMotivation}%). Acción inmediata requerida.`;
    } else if (avgMotivation < 60) {
      severity = 'media';
      message = `⚠️ ${team}: Motivación por debajo del promedio (${avgMotivation}%). Requiere atención.`;
    } else if (stressPercentage > 30) {
      severity = 'media';
      message = `⚠️ ${team}: ${Math.round(stressPercentage)}% del equipo reporta estrés. Revisar cargas de trabajo.`;
    }
    
    if (message) alerts.push({ team, severity, message });
  });
  
  return alerts;
}

function renderAllNotes(filteredMoods) {
  const container = document.getElementById('allNotesList');
  if (!container) return;
  
  const notes = filteredMoods.filter(m => m.note && m.note.trim() !== '').slice(0, 30);
  if (notes.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay notas en el período seleccionado</div>';
    return;
  }
  
  container.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="note-header">
        <span>👤 ${escapeHtml(n.userName)} - ${n.userTeam}</span>
        <span>${formatDate(n.date)}</span>
      </div>
      <div class="note-content">💬 "${escapeHtml(n.note)}"</div>
      <div class="note-mood">${moodMap[n.mood]?.emoji} ${moodMap[n.mood]?.label} | ⭐ ${n.motivation}/5</div>
    </div>
  `).join('');
}

function renderGlobalAlerts(alerts) {
  const container = document.getElementById('globalAlertsList');
  if (!container) return;
  
  const highAlerts = alerts.filter(a => a.severity === 'alta');
  const mediumAlerts = alerts.filter(a => a.severity === 'media');
  
  if (highAlerts.length === 0 && mediumAlerts.length === 0) {
    container.innerHTML = '<div class="alert-placeholder">🟢 Sin alertas críticas. Todo en orden.</div>';
    return;
  }
  
  container.innerHTML = [
    ...highAlerts.map(a => `<div class="alert-item"><i class="fas fa-exclamation-triangle"></i><div>${a.message}</div></div>`),
    ...mediumAlerts.map(a => `<div class="alert-item"><i class="fas fa-exclamation-circle"></i><div>${a.message}</div></div>`)
  ].join('');
}

function exportResumen() {
  const period = document.getElementById('periodFilter').value;
  const team = document.getElementById('teamFilter').value;
  const content = `YouLeader - Reporte Ejecutivo\nPeríodo: ${period}\nEquipo: ${team}\nFecha: ${new Date().toLocaleString()}\n\nClima laboral: ${document.getElementById('globalClima').textContent}\nMotivación promedio: ${document.getElementById('globalMotivacion').textContent}\nAlertas activas: ${document.getElementById('globalAlertas').textContent}\nReconocimientos: ${document.getElementById('globalRecog').textContent}`;
  downloadFile(`resumen_youleader_${period}.txt`, content);
  showToast('📄 Resumen exportado', 'success');
}

function exportDetalle() {
  const content = JSON.stringify(allMoodEntries, null, 2);
  downloadFile(`detalle_moods_${new Date().toISOString().split('T')[0]}.json`, content);
  showToast('📊 Detalle exportado', 'success');
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ========== UTILIDADES ==========
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'Hace unos minutos';
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  return date.toLocaleDateString();
}

function showToast(message, type) {
  // Buscar cualquier toast disponible
  let toast = document.getElementById('moodToast');
  if (!toast) toast = document.getElementById('feedbackToast');
  
  if (toast) {
    toast.textContent = message;
    toast.className = `toast-message ${type}`;
    setTimeout(() => {
      toast.className = 'toast-message';
    }, 3000);
  } else {
    alert(message);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

function logout() {
  localStorage.removeItem('youleader_current_user');
  window.location.href = 'index.html';
}

// ========== INICIAR ==========
init();