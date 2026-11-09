import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Utensils, Wind, Pill, Droplets, AlertCircle, 
  Plus, History, BarChart2, Settings, Trash2, X, CalendarOff
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

const supabaseUrl = 'https://bucjiccpmvofwteglywf.supabase.co';
const supabaseKey = 'sb_publishable_LrYz7A0z5qnC4lYSvILX2g_gBAt7Zh5';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('add');
  const [modalType, setModalType] = useState(null);
  const [events, setEvents] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { 
    fetchEvents();
    fetchCatalogs();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('id', { ascending: false });
    if (data) setEvents(data);
  };
  const fetchCatalogs = async () => {
    const { data } = await supabase.from('catalogs').select('*');
    if (data) setCatalogs(data);
  };

  const saveEvent = async (eventData) => {
    const { error } = await supabase.from('events').insert([eventData]);
    if (error) alert("Ошибка: " + error.message);
    else { fetchEvents(); setModalType(null); setSelectedDay(null); }
  };

  const deleteEvent = async (id) => {
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
    setSelectedDay(null);
  };

  const stats = {
    feed: events.filter(e => e.event_type === 'feed').length,
    med: events.filter(e => e.event_type === 'med').length,
    cough: events.filter(e => e.event_type === 'cough').length,
    vomit: events.filter(e => e.event_type === 'vomit').length,
    toilet: events.filter(e => e.event_type === 'toilet').length,
  };

  // --- УМНАЯ СТАТИСТИКА ПО ЛЕКАРСТВАМ ---
  // Берем все записи типа "med" за выбранный месяц
  const monthMeds = events.filter(e => 
    e.event_type === 'med' && 
    new Date(e.event_date).getMonth() === currentMonth.getMonth() &&
    new Date(e.event_date).getFullYear() === currentMonth.getFullYear()
  );

  // Группируем их по названию (details.subtype)
  const medSummary = {};
  monthMeds.forEach(e => {
    const name = e.details?.subtype || 'Без названия';
    if (!medSummary[name]) medSummary[name] = 0;
    medSummary[name] += 1;
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayColors = (day) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), day));
    const colors = [];
    if (dayEvents.some(e => e.event_type === 'cough')) colors.push('#E57C7C');
    if (dayEvents.some(e => e.event_type === 'vomit')) colors.push('#E5A97C');
    if (dayEvents.some(e => e.event_type === 'toilet')) colors.push('#82B57A');
    return colors;
  };

  const selectedDayEvents = selectedDay 
    ? events.filter(e => isSameDay(new Date(e.event_date), selectedDay))
    : [];

  return (
    <div>
      <header>
        <h1>🐈 Джесси</h1>
        <p>Дневник здоровья</p>
      </header>

      {activeTab === 'add' && (
        <div className="menu-grid">
          <button className="menu-btn" onClick={() => setModalType('feed')}><Utensils /> Кормление</button>
          <button className="menu-btn" onClick={() => setModalType('med')}><Pill /> Лекарство</button>
          <button className="menu-btn" onClick={() => setModalType('cough')}><Wind /> Кашель</button>
          <button className="menu-btn" onClick={() => setModalType('vomit')}><AlertCircle /> Рвота</button>
          <button className="menu-btn" onClick={() => setModalType('toilet')}><Droplets /> Туалет</button>
          <button className="menu-btn" onClick={() => setModalType('negative')} style={{background: '#f0f8f0', borderColor: '#82B57A', color: '#4a7a43'}}><CalendarOff /> Не было</button>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>История записей</h2>
          {events.length === 0 && <p>Пока нет записей...</p>}
          {events.map(ev => (
            <div key={ev.id} className="history-card">
              <div className="stat-info">
                <h3>{getEventTitle(ev.event_type)}</h3>
                <p>{ev.event_date} {ev.details?.subtype ? `• ${ev.details.subtype}` : ''}</p>
                {ev.note && <p style={{ fontStyle: 'italic', fontSize: '12px', color: '#888' }}>"{ev.note}"</p>}
              </div>
              <button className="delete-btn" onClick={() => deleteEvent(ev.id)}><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '10px' }}>Календарь</h2>
          
          <div style={{ background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '20px', border: '2px solid #EDE3D8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#C77F4F' }}>◀</button>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#3D2B1F' }}>
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#C77F4F' }}>▶</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center' }}>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                <div key={d} style={{ fontSize: '12px', color: '#8B7D6B', marginBottom: '5px' }}>{d}</div>
              ))}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => <div key={`empty-${i}`} />)}
              
              {daysInMonth.map(day => {
                const colors = getDayColors(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div 
                    key={day.toString()} 
                    onClick={() => setSelectedDay(day)}
                    style={{ 
                      padding: '8px 0', borderRadius: '8px', cursor: 'pointer',
                      background: isToday ? '#F5D6C1' : '#f9f9f9',
                      border: isToday ? '1px solid #E5A97C' : '1px solid #eee',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
                    }}>
                    <span style={{ fontSize: '14px', fontWeight: isToday ? 'bold' : 'normal', color: '#3D2B1F' }}>{format(day, 'd')}</span>
                    <div style={{ display: 'flex', gap: '2px', height: '6px' }}>
                      {colors.map((c, i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <h2 style={{ marginBottom: '15px' }}>Всего за месяц</h2>
          <div className="stat-card"><div className="stat-info"><h3>🍽 Кормлений</h3></div><div className="stat-value">{stats.feed}</div></div>
          <div className="stat-card"><div className="stat-info"><h3>💊 Лекарств/Добавок (всего)</h3></div><div className="stat-value">{stats.med}</div></div>
          <div className="stat-card"><div className="stat-info"><h3>😮‍💨 Кашля</h3></div><div className="stat-value">{stats.cough}</div></div>
          <div className="stat-card"><div className="stat-info"><h3>🤢 Рвоты</h3></div><div className="stat-value">{stats.vomit}</div></div>
          <div className="stat-card"><div className="stat-info"><h3>🚽 Туалета</h3></div><div className="stat-value">{stats.toilet}</div></div>

          {/* --- НОВЫЙ БЛОК: РАСХОД ЛЕКАРСТВ --- */}
          <h2 style={{ marginBottom: '15px', marginTop: '30px' }}>Расход лекарств за месяц</h2>
          <div style={{ background: 'white', borderRadius: '15px', padding: '15px', marginBottom: '20px', border: '2px solid #EDE3D8' }}>
            {Object.keys(medSummary).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>В этом месяце лекарств не было.</p>
            ) : (
              Object.entries(medSummary).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <strong style={{ fontSize: '16px', color: '#3D2B1F' }}>{name}</strong>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#C77F4F' }}>
                    {count} <span style={{ fontSize: '14px', color: '#888' }}>шт.</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>Справочники</h2>
          <button className="save-btn" onClick={() => setModalType('add_catalog')}>Добавить в справочник</button>
          <div style={{ marginTop: '20px' }}>
            {catalogs.map(c => (
              <div key={c.id} className="history-card">
                <div className="stat-info">
                  <h3>{c.name}</h3>
                  <p>{c.category === 'med' ? '💊 Лекарство' : '🥣 Добавка'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{format(selectedDay, 'd MMMM', { locale: ru })}</h2>
              <button className="close-btn" onClick={() => setSelectedDay(null)}><X /></button>
            </div>
            
            {selectedDayEvents.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', margin: '20px 0' }}>Нет записей за этот день.</p>
            ) : (
              <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                {selectedDayEvents.map(ev => (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>{getEventTitle(ev.event_type)}</strong>
                      {ev.details?.subtype && <span style={{ fontSize: '14px', color: '#666' }}> • {ev.details.subtype}</span>}
                      {ev.note && <div style={{ fontSize: '12px', color: '#888' }}>"{ev.note}"</div>}
                    </div>
                    <button className="delete-btn" onClick={() => deleteEvent(ev.id)}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}
            <button className="save-btn" onClick={() => { setModalType('feed'); setSelectedDay(null); }} style={{marginTop: '15px', background: '#8B7D6B'}}>
              Добавить за этот день
            </button>
          </div>
        </div>
      )}

      {modalType && (
        <EventModal 
          type={modalType} 
          catalogs={catalogs}
          onClose={() => setModalType(null)} 
          onSave={saveEvent}
          onSaveCatalog={async (cat) => {
            await supabase.from('catalogs').insert([cat]);
            fetchCatalogs();
            setModalType(null);
          }}
        />
      )}

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}><Plus /> Добавить</button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><History /> История</button>
        <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart2 /> Статистика</button>
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings /> Настройки</button>
      </nav>
    </div>
  );
}

function EventModal({ type, catalogs, onClose, onSave, onSaveCatalog }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [details, setDetails] = useState({});
  
  const [catName, setCatName] = useState('');
  const [catCategory, setCatCategory] = useState('med');

  if (type === 'add_catalog') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Новый справочник</h2><button className="close-btn" onClick={onClose}><X /></button></div>
          <div className="form-group">
            <label>Название</label>
            <input type="text" placeholder="Например: Преднизолон" value={catName} onChange={e => setCatName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select value={catCategory} onChange={e => setCatCategory(e.target.value)}>
              <option value="med">Лекарство</option>
              <option value="supplement">Добавка</option>
            </select>
          </div>
          <button className="save-btn" onClick={() => onSaveCatalog({ name: catName, category: catCategory })}>Добавить</button>
        </div>
      </div>
    );
  }

  if (type === 'negative') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><h2>Чего не было?</h2><button className="close-btn" onClick={onClose}><X /></button></div>
          <div className="form-group">
            <label>Дата</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>Эта отметка покажет, что в этот день всё было хорошо.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
             {['cough', 'vomit'].map(t => (
               <button key={t} className="toggle-btn" onClick={() => {
                 onSave({ event_type: 'negative_' + t, event_date: date, note: 'Не было' });
               }}>{t === 'cough' ? 'Кашля не было' : 'Рвоты не было'}</button>
             ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredCatalogs = catalogs.filter(c => 
    (type === 'med' && (c.category === 'med' || c.category === 'supplement')) || 
    (type === 'feed' && c.category === 'food')
  );

  const handleSave = () => {
    onSave({ event_type: type, event_date: date, note: note, details: details });
  };

  const titles = { feed: 'Кормление', cough: 'Кашель', med: 'Лекарство/Добавка', toilet: 'Туалет', vomit: 'Рвота' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{titles[type]}</h2><button className="close-btn" onClick={onClose}><X /></button></div>
        <div className="form-group">
          <label>Дата</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {type === 'feed' && (
          <div className="form-group">
            <label>Тип корма</label>
            <div className="toggle-group">
              <button className={`toggle-btn ${details.subtype === 'dry' ? 'active' : ''}`} onClick={() => setDetails({...details, subtype: 'dry'})}>Сухой</button>
              <button className={`toggle-btn ${details.subtype === 'wet' ? 'active' : ''}`} onClick={() => setDetails({...details, subtype: 'wet'})}>Влажный</button>
            </div>
          </div>
        )}

        {(type === 'cough' || type === 'vomit') && (
          <div className="form-group">
            <label>Интенсивность / Тип</label>
            <input type="text" placeholder="Например: сильный, с шерстью..." onChange={e => setDetails({...details, subtype: e.target.value})} />
          </div>
        )}

        {type === 'toilet' && (
          <div className="form-group">
            <label>Что было</label>
            <div className="toggle-group">
              <button className={`toggle-btn ${details.subtype === 'urine' ? 'active' : ''}`} onClick={() => setDetails({...details, subtype: 'urine'})}>💧 Моча</button>
              <button className={`toggle-btn ${details.subtype === 'poop' ? 'active' : ''}`} onClick={() => setDetails({...details, subtype: 'poop'})}>💩 Кал</button>
            </div>
          </div>
        )}

        {type === 'med' && (
          <div className="form-group">
            <label>Выбери из справочника или впиши</label>
            <select onChange={e => setDetails({...details, subtype: e.target.value})} style={{marginBottom: '10px'}}>
              <option value="">-- Выбрать --</option>
              {filteredCatalogs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Или впиши вручную..." onChange={e => setDetails({...details, subtype: e.target.value})} />
          </div>
        )}

        <div className="form-group">
          <label>Заметка (необязательно)</label>
          <textarea rows="2" value={note} onChange={e => setNote(e.target.value)} placeholder="Любой комментарий..."></textarea>
        </div>
        <button className="save-btn" onClick={handleSave}>Сохранить</button>
      </div>
    </div>
  );
}

function getEventTitle(type) {
  const titles = { feed: '🍽 Кормление', cough: '😮‍💨 Кашель', med: '💊 Лекарство', toilet: '🚽 Туалет', vomit: '🤢 Рвота', negative_cough: '✅ Кашля не было', negative_vomit: '✅ Рвоты не было' };
  return titles[type] || type;
}
