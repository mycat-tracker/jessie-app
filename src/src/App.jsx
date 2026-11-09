import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Utensils, Wind, Pill, Droplets, AlertCircle, 
  Plus, History, BarChart2, Trash2, X 
} from 'lucide-react';
import { format } from 'date-fns';

// --- ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ ---
const supabaseUrl = 'https://bucjiccpmvofwteglywf.supabase.co';
const supabaseKey = 'sb_publishable_LrYz7A0z5qnC4lYSvILX2g_gBAt7Zh5';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [activeTab, setActiveTab] = useState('add'); // add, history, stats
  const [modalType, setModalType] = useState(null); // feed, cough, med, toilet, vomit
  const [events, setEvents] = useState([]);

  // Загрузка данных при старте
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('id', { ascending: false });
    if (error) {
      console.error(error);
      alert("Ошибка загрузки: " + error.message);
    } else if (data) {
      setEvents(data);
    }
  };

  // Сохранение записи
  const saveEvent = async (eventData) => {
    const payload = {
      event_type: eventData.event_type,
      event_date: eventData.event_date,
      note: eventData.note || null,
      details: eventData.details || {}
    };
    
    const { error } = await supabase.from('events').insert([payload]);
    if (error) {
      alert("Ошибка при сохранении: " + error.message);
    } else {
      fetchEvents();
      setModalType(null);
    }
  };

  // Удаление записи
  const deleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert("Ошибка удаления: " + error.message);
    else fetchEvents();
  };

  return (
    <div>
      <header>
        <h1>🐈 Джесси</h1>
        <p>Дневник здоровья</p>
      </header>

      {/* --- ЭКРАН: ДОБАВИТЬ --- */}
      {activeTab === 'add' && (
        <div className="menu-grid">
          <button className="menu-btn" onClick={() => setModalType('feed')}>
            <Utensils /> Кормление
          </button>
          <button className="menu-btn" onClick={() => setModalType('med')}>
            <Pill /> Лекарство
          </button>
          <button className="menu-btn" onClick={() => setModalType('cough')}>
            <Wind /> Кашель
          </button>
          <button className="menu-btn" onClick={() => setModalType('vomit')}>
            <AlertCircle /> Рвота
          </button>
          <button className="menu-btn" onClick={() => setModalType('toilet')}>
            <Droplets /> Туалет
          </button>
        </div>
      )}

      {/* --- ЭКРАН: ИСТОРИЯ --- */}
      {activeTab === 'history' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>Последние записи</h2>
          {events.length === 0 && <p>Пока нет записей...</p>}
          {events.map(ev => (
            <div key={ev.id} className="history-card">
              <div className="stat-info">
                <h3>{getEventTitle(ev.event_type)}</h3>
                <p>{ev.event_date} {ev.details?.subtype ? `• ${ev.details.subtype}` : ''}</p>
                {ev.note && <p style={{ fontStyle: 'italic' }}>"{ev.note}"</p>}
              </div>
              <button className="delete-btn" onClick={() => deleteEvent(ev.id)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- ЭКРАН: СТАТИСТИКА (Упрощенная версия) --- */}
      {activeTab === 'stats' && (
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>Статистика</h2>
          <div className="stat-card">
            <div className="stat-info"><h3>Всего записей</h3></div>
            <div className="stat-value">{events.length}</div>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО (ФОРМА) --- */}
      {modalType && (
        <EventModal 
          type={modalType} 
          onClose={() => setModalType(null)} 
          onSave={saveEvent} 
        />
      )}

      {/* --- НИЖНЕЕ МЕНЮ --- */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          <Plus /> Добавить
        </button>
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History /> История
        </button>
        <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          <BarChart2 /> Статистика
        </button>
      </nav>
    </div>
  );
}

// --- КОМПОНЕНТ ФОРМЫ ---
function EventModal({ type, onClose, onSave }) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [details, setDetails] = useState({});

  const handleSave = () => {
    onSave({
      event_type: type,
      event_date: date,
      note: note,
      details: details
    });
  };

  const titles = { feed: 'Кормление', cough: 'Кашель', med: 'Лекарство/Добавка', toilet: 'Туалет', vomit: 'Рвота' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titles[type]}</h2>
          <button className="close-btn" onClick={onClose}><X /></button>
        </div>

        <div className="form-group">
          <label>Дата</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Специфичные поля для каждого типа */}
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
            <label>Название и доза</label>
            <input type="text" placeholder="Например: Преднизолон, 1 шт" onChange={e => setDetails({...details, subtype: e.target.value})} />
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
  const titles = { feed: '🍽 Кормление', cough: '😮‍💨 Кашель', med: '💊 Лекарство', toilet: '🚽 Туалет', vomit: '🤢 Рвота' };
  return titles[type] || type;
}
