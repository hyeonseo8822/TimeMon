import React, { useState } from 'react';
import Calendar from 'react-calendar';
import './css/MyCalendar.css'; // 여기에 CSS 커스터마이징이 포함됨

function MyCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        showNeighboringMonth={false}
        locale="ko-KR"
      />
    </div>
  );
}

export default MyCalendar;
