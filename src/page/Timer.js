
import './css/Timer.css'
import BottomBar from '../component/BottomBar';
import Button from '../component/Button';
import React, { useState, useRef } from 'react';


function Timer() {
  //false 시작
  const [isRunning, setIsRunning] = useState(false);
  const [goals, setGoals] = useState([]); // 목표 리스트
  const timer = React.useRef(0);
  const timerInterval = React.useRef(null);
  const timerP = React.useRef(null);

  function formatTime(time) {
    let hrs = Math.floor(time / 3600).toString().padStart(2, '0');
    let mins = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  function toggleTimer() {
    if (isRunning) {
      clearInterval(timerInterval.current);
    } else {
      timerInterval.current = setInterval(() => {
        timer.current++;
        timerP.current.innerText = formatTime(timer.current);
      }, 1000);
    }
    setIsRunning(!isRunning);
  }
  function addGoal() {
    let id = prompt("과목 입력")
    let time = prompt("시간 입력")
    const newGoal = { id: Date.now(), subject: id, time: time };
    setGoals(prev => [...prev, newGoal]);
  }

  function removeGoal(id) {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
  }
  function restart() {
    timer.current = 0;
    timerP.current.innerText = '00:00:00'; // 텍스트도 초기화
  }

  return (
    <div className="container">
      <div className="character">
        <img src="/img/lemon.svg" alt="레몬이" />
      </div>

      <div className='timer'>
        <p ref={timerP}>00:00:00</p>
      </div>

      <div className='timerBtns'>
        <Button className="leftbtn" text={isRunning ? "중지" : "시작"} bgColor={isRunning ? "#F39292" : "#C4FF90"} onClick={toggleTimer} />
        <Button className="rightbtn" text={isRunning ? "목표" : "리셋"} bgColor="#FFFDC4" onClick={isRunning ? addGoal : restart} />
      </div>

      <div className='goalBar'>
        {goals.length === 0 ? (<p className='noGoal'>목표가 아직 없습니다.</p>) :
          (
            <div className='goals'>
              {goals.map(goal => (
                <div className='goal' key={goal.id} onDoubleClick={() => removeGoal(goal.id)} style={{ cursor: 'pointer' }}>
                  <p className='goalText'>{goal.subject}</p>
                  <p>{goal.time}</p>
                </div>
              ))}
            </div>
          )}
      </div>
      <BottomBar />
    </div>
  );
}

export default Timer;
