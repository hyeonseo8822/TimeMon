import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/App.css';
import BottomBar from '../component/BottomBar';
import StudyBarChart from '../component/StudyBarChart';


function App() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [characterImage, setCharacterImage] = useState(null);
  const [characterAlt, setCharacterAlt] = useState('');
  const [studyTime, setStudyTime] = useState(0);
  const [avgStudyTime, setAvgStudyTime] = useState(0);
  const [todayLog, setTodayLog] = useState(null);
  const [timerTime, setTimerTime] = useState(() => {
    return parseInt(localStorage.getItem('timerTime')) || 0;
  });
  const isRunning = localStorage.getItem('isRunning') === 'true';

  const intervalRef = useRef(null);

  function formatTime(time) {
    let hrs = Math.floor(time / 3600).toString().padStart(2, '0');
    let mins = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    let secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }

  function isThisWeek(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    return date >= sunday && date <= saturday;
  }

  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const date = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${date}`;
  }


  useEffect(() => {
    const CharStudyTime = async () => {
      try {
        const userRes = await fetch('/data/user.json');
        const characterRes = await fetch('/data/characters.json');
        const logRes = await fetch('/data/dailyLogs.json');

        const users = await userRes.json();
        const characters = await characterRes.json();
        const logs = await logRes.json();
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

        const todayStr = getTodayString();


        const todayLog = logs.find(log =>
          log.userId === userId &&
          log.date.startsWith(todayStr)
        );

        const foundTodayLog = logs.find(log =>
          log.userId === userId && log.date.startsWith(todayStr)
        );
        setTodayLog(foundTodayLog || null);

        if (todayLog) {
          setStudyTime(todayLog.totalStudyTime);
          localStorage.setItem('goals', JSON.stringify(todayLog.goals));
        }

        const thisWeekLogs = logs.filter(
          log => log.userId === userId && isThisWeek(log.date)
        );

        if (thisWeekLogs.length > 0) {
          const total = thisWeekLogs.reduce((sum, log) => sum + log.totalStudyTime, 0);
          const avg = total / thisWeekLogs.length;
          setAvgStudyTime(avg);
        } else {
          setAvgStudyTime(0);
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
        setTimerTime(prev => {
          const newTime = prev + 1;
          localStorage.setItem('timerTime', newTime.toString());
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (todayLog) {
      setStudyTime(todayLog.totalStudyTime);
      localStorage.setItem('goals', JSON.stringify(todayLog.goals));
    }
  }, [todayLog]);

  useEffect(() => {
    if (todayLog) {
      setStudyTime(todayLog.totalStudyTime + timerTime);
    } else {
      setStudyTime(timerTime);
    }
  }, [timerTime, todayLog]);

  return (
    <div className="container2">
      {/* 캐릭터 이미지 */}
      <div className="character">
        {characterImage ? (
          <img src={characterImage} alt={characterAlt} />
        ) : (
          <p>캐릭터 로딩 중...</p>
        )}
      </div>

      <div className='studyBar'>
        <div className='studyTimeBar'>
          <p className='timeText'>오늘 공부한 시간</p>
          <h1 className='time'>{formatTime(studyTime)}</h1>
        </div>

        <div className="pageBar">
          <div className='pageBtns'>
            <div className='clock'>
              <img src='img/Clock.svg' alt='시계' />
              <button className='timerbtn' onClick={() => navigate('/timer')} >타이머</button>
            </div>
            <div className='inventory'>
              <img src='img/Inventory.svg' alt='인벤토리' />
              <button className='inventorybtn' onClick={() => navigate('/inventory')}>인벤토리</button>
            </div>
          </div>
        </div>
      </div>

      <div className='graphBack'>
        <p className='avgText'>일일평균</p>
        <p className='avgTime'>
          {Math.floor(avgStudyTime / 3600)}시간 {Math.floor((avgStudyTime % 3600) / 60)}분
        </p>
        <StudyBarChart userId={userId} todayLog={todayLog}/>
      </div>
      <BottomBar />
    </div>
  );
}

export default App;