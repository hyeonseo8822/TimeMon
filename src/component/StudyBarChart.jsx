import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './css/StudyBarChart.css';

const data = [
  { name: '월', 공부시간: 2 },
  { name: '화', 공부시간: 3 },
  { name: '수', 공부시간: 4 },
  { name: '목', 공부시간: 2.5 },
  { name: '금', 공부시간: 5 },
  { name: '토', 공부시간: 3.5 },
  { name: '일', 공부시간: 1 },
];

function StudyBarChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="name" stroke="#5E523A" />
          <YAxis stroke="#5E523A" />
          <Tooltip contentStyle={{ backgroundColor: "#fdf6e3", borderColor: "#888", color: "#5E523A" }} />
          <Bar dataKey="공부시간" fill="#82ca9d" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StudyBarChart;
