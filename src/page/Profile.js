import './css/Profile.css';
import BottomBar from '../component/BottomBar';
import MyCalendar from '../component/MyCalendar';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../component/Modal';

function Profile() {
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const [characterImage, setCharacterImage] = useState(null);
  const [characterAlt, setCharacterAlt] = useState('');

  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [averageTime, setAverageTime] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [totalStudyTimeSumSec, setTotalStudyTimeSumSec] = useState(0);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const isRunning = localStorage.getItem('isRunning') === 'true';
  const [userLogs, setUserLogs] = useState([]);
  const [timerTime, setTimerTime] = useState(() => {
    return parseInt(localStorage.getItem('timerTime')) || 0;
  });

  const intervalRef = useRef(null);


  const handleProfileEditClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    await handleUserIdChange();
    setIsModalOpen(false);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleUserIdChange = async () => {
    try {
      const NewId = newUserId.trim();
      if (!NewId) {
        return;
      }
      const res = await fetch('http://localhost:5000/update-userid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUserId: localStorage.getItem('userId'),
          newUserId: NewId,
        }),
      });

      if (!res.ok) throw new Error('서버 수정 실패');

      localStorage.setItem('userId', NewId);
      window.location.reload();
    } catch (error) {
      setErrorMessage('아이디 변경에 실패했습니다.');
      setErrorModalOpen(true);
    }
  };

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

        const filteredLogs = logs.filter(log => log.userId === userId);
        setUserLogs(filteredLogs);

        const totalTime = filteredLogs.reduce((sum, log) => sum + (log.totalStudyTime || 0), 0);
        setTotalStudyTimeSumSec(totalTime);

      } catch (error) {
        console.error('데이터를 불러오는 중 오류:', error);
      }
    };

    if (userId) {
      CharStudyTime();
    }
  }, [userId]);


  useEffect(() => {
    const accumulated = totalStudyTimeSumSec + timerTime;
    setAccumulatedTime(accumulated);

    if (userLogs.length > 0) {
      const avg = Math.floor(accumulated / userLogs.length);
      setAverageTime(avg);
    } else {
      setAverageTime(0);
    }

    localStorage.setItem('accumulatedTime', accumulated.toString());
  }, [totalStudyTimeSumSec, timerTime, userLogs]);

  useEffect(() => {
    if (!userLogs || userLogs.length === 0) return;

    const currentTotal = accumulatedTime;
    const avg = Math.floor(currentTotal / userLogs.length);
    setAverageTime(avg);
  }, [accumulatedTime, userLogs]);

  const formatTime = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}시간 ${m}분`;
  };


  if (!userId) {
    return (
      <div className="container2">
        <button className="noLogin" onClick={handleLogin}>로그인 하러 가기</button>
        <BottomBar />
      </div>
    );
  }
  return (
    <div className="container2">
      <div className='rectangle'>
        <div className='circle2'>
          {characterImage ? (
            <img src={characterImage} alt={characterAlt} className="charProfile" />
          ) : (
            <p>캐릭터 로딩 중...</p>
          )}
        </div>
      </div>
      <p className='userName'>{userId}</p>
      <div className='profileEdit' onClick={handleProfileEditClick}>
        <p className='profileEditText'>프로필 편집</p>
        <img className='PencilSquare' src='img/PencilSquare.svg' alt='수정' />
      </div>
      {isModalOpen && (
        <Modal size="small" version="top" onClose={closeModal}>
          <div className="editNameWrapper">
            <p className="editName">아이디</p>
            <div className="editNameBox">
              <input
                type="text"
                className="editNameInput"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                maxLength={10}
              />
            </div>
          </div>
        </Modal>
      )}
      <div className='Times'>
        <div className='accumulTime'>
          <p className='accumulTimeText'>누적시간</p>
          <p className='accumulTimeTextTime'>{formatTime(accumulatedTime)}</p>
        </div>
        <div className='avgTime2'>
          <p className='avgTime2Text'>평균시간</p>
          <p className='avgTime2TextTime'>{formatTime(averageTime)}</p>
        </div>
      </div>
      <MyCalendar />
      <div className='calendarbox'></div>

      {errorModalOpen && (
        <Modal size="small" version="top" onClose={() => setErrorModalOpen(false)}>
          <p className="modalMessage">{errorMessage}</p>
        </Modal>
      )}
      <BottomBar />
    </div>
  );
}

export default Profile;
