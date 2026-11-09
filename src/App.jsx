import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Твои ключи от базы данных
const supabaseUrl = 'https://bucjiccpmvofwteglywf.supabase.co';
const supabaseKey = 'sb_publishable_LrYz7A0z5qnC4lYSvILX2g_gBAt7Zh5';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [events, setEvents] = useState([]);
  const [modalType, setModalType] = useState(null); // 'feed', 'cough', etc.
  const [tab, setTab] = useState('add'); // 'add', 'history', 'stats'
  const [note, setNote] = useState('');

  // Загружаем данные при старте
  useEffect(() => { 
    fetchEvents(); 
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('id', { ascending: false });
    if (error) {
      alert("Ошибка загрузки: " + error.message);
    } else {
      setEvents(data || []);
    }
  };

  // Сохраняем запись
  const saveEvent = async (type) => {
    const newEvent = {
      event_type: type,
      event_date: new Date().toISOString().split('T')[0], // Сегодняшняя дата
      note: note || null,
      details: { test: true }
    };
    
    const { error } = await supabase.from('events').insert([newEvent]);
    
    if (error) {
      alert("ОШИБКА БАЗЫ: " + error.message);
    } else {
      setNote('');
      setModalType(null);
      fetchEvents(); // Обновляем список
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🐈 Джесси</h1>
      
      {/* Вкладки */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setTab('add')} style={{ flex: 1, padding: '10px' }}>Добавить</button>
        <button onClick={() => setTab('history')} style={{ flex: 1, padding: '10px' }}>История</button>
        <button onClick={() => setTab('stats')} style={{ flex: 1, padding: '10px' }}>Статистика</button>
      </div>

      {/* Экран Добавления */}
      {tab === 'add' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <button onClick={() => setModalType('feed')} style={{ padding: '15px', fontSize: '16px' }}>🍽 Кормление</button>
          <button onClick={() => setModalType('med')} style={{ padding: '15px', fontSize: '16px' }}>💊 Лекарство</button>
          <button onClick={() => setModalType('cough')} style={{ padding: '15px', fontSize: '16px' }}>😮‍💨 Кашель</button>
          <button onClick={() => setModalType('toilet')} style={{ padding: '15px', fontSize: '16px' }}>🚽 Туалет</button>
          <button onClick={() => setModalType('vomit')} style={{ padding: '15px', fontSize: '16px' }}>🤢 Рвота</button>
        </div>
      )}

      {/* Экран Истории */}
      {tab === 'history' && (
        <div>
          {events.length === 0 ? <p>Пока нет записей</p> : events.map(ev => (
            <div key={ev.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
              <strong>{ev.event_type}</strong> — {ev.event_date}
              {ev.note && <p style={{ fontSize: '12px', color: '#666' }}>{ev.note}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Экран Статистики */}
      {tab === 'stats' && (
        <div>
          <h3>Всего записей: {events.length}</h3>
        </div>
      )}

      {/* Всплывающее окно (Форма) */}
      {modalType && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '80%' }}>
            <h3>Записать: {modalType}</h3>
            <input 
              type="text" 
              placeholder="Заметка..." 
              value={note} 
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => saveEvent(modalType)} style={{ flex: 1, padding: '10px', background: 'green', color: 'white' }}>Сохранить</button>
              <button onClick={() => setModalType(null)} style={{ flex: 1, padding: '10px' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
