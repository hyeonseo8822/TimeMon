
import './css/Timer.css'
import BottomBar from '../component/BottomBar';
import Button from '../component/Button';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Modal from '../component/Modal';

function Timer() {

  const userId = localStorage.getItem('userId');

  const [characterImage, setCharacterImage] = useState(null);
  const [characterAlt, setCharacterAlt] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timer = useRef(0);
  const timerP = useRef(null);
  const intervalRef = useRef(null);
  const lastSentTime = useRef(0);


  const openModal = () => setIsModalOpen(true);
  function closeModal() {
    addGoal();
    setIsModalOpen(false);
  }

  const [goals, setGoals] = useState([]);
  useEffect(() => {
    const arrGoal = JSON.parse(localStorage.getItem('goals'));
    if (Array.isArray(arrGoal)) {
      setGoals(arrGoal);
    }
  }, []);

  const [isRunning, setIsRunning] = useState(() => {
    const savedRunning = localStorage.getItem('isRunning');
    return savedRunning ? JSON.parse(savedRunning) : false;
  });
  function formatTime(time) {
    let hrs = Math.floor(time / 3600).toString().padStart(2, '0');
    let mins = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }
  function toggleTimer() {
    setIsRunning(prev => !prev);
  }

  function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  function addGoal() {
    const today = getTodayString();
    const sameSubjectCount = goals.filter(g => g.subject === subject).length;

    const newGoal = {
      id: `${today}_${subject}_${sameSubjectCount}`,
      subject: subject,
      goalTime: hours * 3600 + minutes * 60 + seconds,
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));

    fetch('http://localhost:5000/addgoal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        goal: {
          id: newGoal.id,
          subject: newGoal.subject,
          goalTime: newGoal.goalTime,
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('dailyLogs 업데이트 완료:', data);
      })
      .catch(err => {
        console.error('dailyLogs 업데이트 실패:', err);
      });

    setSubject('');
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  }


  function removeGoal(id) {

    const updatedGoals = goals.filter(goal => goal.id !== id);

    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));

    fetch(`http://localhost:5000/deletegoal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        goalId: String(id)
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`서버 오류 상태 코드: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('dailyLogs 삭제 완료:', data);
      })
      .catch(err => {
        console.error('dailyLogs 삭제 실패:', err);
      });
  }


  const restart = useCallback(() => {
    const currentTime = parseInt(localStorage.getItem('timerTime')) || 0;
    if (currentTime > 0) {
      fetch('http://localhost:5000/updateStudyTime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          date: getTodayString(),
          additionalTime: currentTime
        })
      })
        .then(() => {
          timer.current = 0;
          if (timerP.current) {
            timerP.current.innerText = '00:00:00';
          }
          localStorage.setItem('timerTime', 0);
          setIsRunning(false);
        })
        .catch((err) => {
          console.error('타이머 초기화 전 서버 전송 실패:', err);
          timer.current = 0;
          if (timerP.current) {
            timerP.current.innerText = '00:00:00';
          }
          localStorage.setItem('timerTime', 0);
          setIsRunning(false);
        });
    } else {
      timer.current = 0;
      if (timerP.current) {
        timerP.current.innerText = '00:00:00';
      }
      localStorage.setItem('timerTime', 0);
      setIsRunning(false);
    }
  }, [userId]);


  useEffect(() => {
    const CharStudyTime = async () => {
      try {
        const userRes = await fetch('/data/user.json');
        const characterRes = await fetch('/data/characters.json');

        const users = await userRes.json();
        const characters = await characterRes.json();
        const currentUser = users.find(user => user.userId === userId);

        if (!currentUser) {
          const defaultChar = characters.find(char => char.id === 'lemon');
          if (defaultChar) {
            setCharacterImage(`/img/${defaultChar.image}`);
            setCharacterAlt(defaultChar.name);
          }
        } else {
          const selectedChar = characters.find(char => char.id === currentUser.selectedCharacter);
          if (selectedChar) {
            setCharacterImage(`/img/${selectedChar.image}`);
            setCharacterAlt(selectedChar.name);
          }
        }
      } catch (error) {
        console.error('데이터를 불러오는 중 오류:', error);
      }
    };

    CharStudyTime();
  }, [userId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        timer.current += 1;
        localStorage.setItem('timerTime', timer.current.toString());

        if (timerP.current) {
          timerP.current.innerText = formatTime(timer.current);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);

      const savedTime = parseInt(localStorage.getItem('timerTime')) || 0;
      timer.current = savedTime;
      lastSentTime.current = savedTime;
      localStorage.setItem('timerTime', savedTime.toString());

      if (timerP.current) {
        timerP.current.innerText = formatTime(savedTime);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    let savedTime = parseInt(localStorage.getItem('timerTime')) || 0;
    const serverOffTime = parseInt(localStorage.getItem('serverOffTime')) || 0;

    if (localStorage.getItem('isRunning') === 'true' && serverOffTime) {
      const lostTime = Math.floor((Date.now() - serverOffTime) / 1000);
      savedTime += lostTime;
      localStorage.setItem('timerTime', savedTime.toString());
      localStorage.removeItem('serverOffTime');
    }

    timer.current = savedTime;
    if (timerP.current) {
      timerP.current.innerText = formatTime(savedTime);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRunning) {
        localStorage.setItem('serverOffTime', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('isRunning', isRunning ? 'true' : 'false');
  }, [isRunning]);
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      if (hours === 0 && minutes === 0 && seconds === 0) {
        restart();
      }
    };

    const intervalId = setInterval(checkMidnight, 1000);

    return () => clearInterval(intervalId);
  }, [restart]);

  return (
    <div className="container">
      <div className="character">
        {characterImage ? (
          <img src={characterImage} alt={characterAlt} />
        ) : (
          <p>캐릭터 로딩 중...</p>
        )}
      </div>

      <div className='timer'>
        <p ref={timerP}>00:00:00</p>
      </div>

      <div className='timerBtns'>
        <Button className="leftbtn" text={isRunning ? "중지" : "시작"} bgColor={isRunning ? "#F39292" : "#C4FF90"} onClick={toggleTimer} />
        <Button className="rightbtn" text={isRunning ? "목표" : "리셋"} bgColor="#FFFDC4" onClick={isRunning ? openModal : restart} />

      </div>

      <div className='goalBar'>
        {goals.length === 0 ? (<p className='noGoal'>목표가 아직 없습니다.</p>) :
          (
            <div className='goals'>
              {goals.map(goal => (
                <div
                  className='goal'
                  key={goal.id}
                  onDoubleClick={() => removeGoal(goal.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <p className='goalText'>{goal.subject}</p>
                  <p>{formatTime(goal.goalTime)}</p>
                </div>
              ))}
            </div>
          )}
      </div>
      {isModalOpen && (
        <Modal version="top" size="large" onClose={closeModal}>
          <h2>목표 설정</h2>

          <div className='goalName'>
            <p className='subject'>과목</p>
            <div className='subjectBox'>
              <input
                type="text"
                className="subjectInput"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={10}
              />
            </div>
          </div>

          <div className='timeInput'>
            <p className='timeInputText'>시간</p>
            <div className="time-unit">
              <button onClick={() => setHours((prev) => (prev + 1) % 24)}>▲</button>
              <span>{hours.toString().padStart(2, '0')}</span>
              <button onClick={() => setHours((prev) => (prev - 1 + 24) % 24)}>▼</button>
            </div>
            <div className="colon">:</div>
            <div className="time-unit">
              <button onClick={() => setMinutes((prev) => (prev + 1) % 60)}>▲</button>
              <span>{minutes.toString().padStart(2, '0')}</span>
              <button onClick={() => setMinutes((prev) => (prev - 1 + 60) % 60)}>▼</button>
            </div>
            <div className="colon">:</div>
            <div className="time-unit">
              <button onClick={() => setSeconds((prev) => (prev + 1) % 60)}>▲</button>
              <span>{seconds.toString().padStart(2, '0')}</span>
              <button onClick={() => setSeconds((prev) => (prev - 1 + 60) % 60)}>▼</button>
            </div>
          </div>
        </Modal>
      )}
      <BottomBar />
    </div>
  );
}

export default Timer;
