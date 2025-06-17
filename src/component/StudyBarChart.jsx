import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './css/StudyBarChart.css';


function StudyBarChart({ userId, todayLog }) {
  const [logs, setLogs] = useState([]);
  const [timerTime, setTimerTime] = useState(Number(localStorage.getItem('timerTime')) || 0);


  const days = ['일', '월', '화', '수', '목', '금', '토'];

  // 🔁 실시간 timerTime 반영
  useEffect(() => {
    const interval = setInterval(() => {
      const latestTime = Number(localStorage.getItem('timerTime')) || 0;
      setTimerTime(latestTime);
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  function isThisWeek(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    return date >= sunday && date <= saturday;
  }

  function getDayName(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const dayIndex = date.getDay();
    return days[dayIndex];
  }

  useEffect(() => {
    fetch('/data/dailyLogs.json')
      .then(response => response.json())
      .then(data => setLogs(data))
      .catch(error => console.error('데이터 로드 실패:', error));
  }, []);

  const thisWeekLogs = logs.filter(
    log => log.userId === userId && isThisWeek(log.date)
  );

  let data = days.map(day => ({
    name: day,
    공부시간: 0,
  }));

  thisWeekLogs.forEach(log => {
    const dayName = getDayName(log.date);
    const idx = data.findIndex(d => d.name === dayName);
    if (idx !== -1) {
      data[idx].공부시간 += log.totalStudyTime / 3600;
    }
  });

  if (todayLog) {
    const today = new Date();
    const dayName = days[today.getDay()];
    const idx = data.findIndex(d => d.name === dayName);
    if (idx !== -1) {
      const additional = timerTime / 3600;
      data[idx].공부시간 += additional;
    }
  }


  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#5E523A" />
          <YAxis stroke="#5E523A" />
          <Tooltip
            contentStyle={{ backgroundColor: "#fdf6e3", borderColor: "#888", color: "#5E523A" }}
            formatter={(value) => {
              const totalMinutes = value * 60;
              const hours = Math.floor(totalMinutes / 60);
              const minutes = Math.round(totalMinutes % 60);
              return [`${hours}시간 ${minutes}분`, '공부시간'];
            }}
          />
          <Bar dataKey="공부시간" fill="#82ca9d" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StudyBarChart;
