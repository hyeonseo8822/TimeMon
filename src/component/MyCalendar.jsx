import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './css/MyCalendar.css';
import Modal from './Modal';


function MyCalendar() {
  const userId = localStorage.getItem('userId');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkedDates, setCheckedDates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return;

        const res = await fetch('/data/dailyLogs.json');
        const logs = await res.json();

        setLogs(logs);

        const checked = logs
          .filter(log => log.userId === userId && log.totalStudyTime > 0)
          .map(log => new Date(log.date).toDateString());

        setCheckedDates(checked);
      } catch (error) {
        console.error('로그 로드 오류:', error);
      }
    };

    fetchData();
  }, []);

  const tileClassName = ({ date, view }) => {
    if (view === 'month' && isCheckedDate(date)) {
      return 'hide-day';
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month' && isCheckedDate(date)) {
      return (
        <div className="check-icon">
          <img src="/img/check.svg" alt="check" width={40} />
        </div>
      );
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);

    const log = logs.find(
      (l) =>
        l.userId === userId &&
        new Date(l.date).toDateString() === date.toDateString()
    );

    setSelectedLog(log || null);
    setModalOpen(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };
  function isCheckedDate(date) {
    const dateString = date.toDateString();
    const todayString = new Date().toDateString();
    return checkedDates.includes(dateString) && dateString !== todayString;
  }

  return (
    <div>
      <Calendar
        onChange={setSelectedDate}
        showNeighboringMonth={false}
        locale="ko-KR"
        tileContent={tileContent}
        tileClassName={tileClassName}
        onClickDay={handleDateClick}
        value={new Date()}
      />
      {modalOpen && (
        <Modal version='top' onClose={() => setModalOpen(false)} size="large">
          {selectedLog ? (
            <div>
              <h2 className='selectedDate'>
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <div className='goalList'>
                {selectedLog.goals.map((goal, index) => (
                  <div key={index} className='goalTimeText'>
                    {goal.subject} 목표 시간: {formatTime(goal.goalTime)}
                  </div>
                ))}
              </div>
              <p className='totalStudyTimeText'>
                총 공부 시간: {formatTime(selectedLog.totalStudyTime)}
              </p>
            </div>
          ) : (
            <div>
              <h2 className='selectedDate'>
                {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <p className='nototalStudyTimeText'>공부를 안했습니다.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default MyCalendar;
