import './css/inventory.css'
import BottomBar from '../component/BottomBar';
import { Select } from '@headlessui/react'
import { useEffect, useState, useRef } from 'react';
import './css/App.css';
import Modal from '../component/Modal';

function Inventory() {
  const userId = localStorage.getItem('userId');

  const [characterImage, setCharacterImage] = useState(null);
  const [characterDescription, setCharacterDescription] = useState('');
  const [characterAlt, setCharacterAlt] = useState('');
  const [characters, setCharacters] = useState([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const isRunning = localStorage.getItem('isRunning') === 'true';
  const [filterStatus, setFilterStatus] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [lockedCharModalOpen, setLockedCharModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockedNames, setUnlockedNames] = useState('');

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const stored = localStorage.getItem('accumulatedTime');
  const accumulatedTime = stored ? parseFloat(stored) : 0;

  const [timerTime, setTimerTime] = useState(() => {
    return parseInt(localStorage.getItem('timerTime')) || 0;
  });

  const intervalRef = useRef(null);

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
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const userRes = await fetch('/data/user.json');
        const users = await userRes.json();
        const foundUser = users.find(user => user.userId === userId);
        setCurrentUser(foundUser);
      } catch (error) {
        console.error('사용자 정보 불러오기 실패:', error);
      }
    };

    fetchUser();
  }, [userId]);

  const unlockedIds = currentUser?.unlockedCharacters || ["lemon"];
  const filteredCharacters = characters.filter((char) => {
    if (filterStatus === 'unlocked') {
      return unlockedIds.includes(char.id);
    } else if (filterStatus === 'locked') {
      return !unlockedIds.includes(char.id);
    }
    return true;
  });

  const handleCharacterSelect = async (char) => {
    if (!userId || !currentUser) return;

    if (!currentUser.unlockedCharacters.includes(char.id)) {
      setLockedCharModalOpen(true);
      return;
    }

    setCharacterImage(`/img/${char.image}`);
    setCharacterAlt(char.name);
    setSelectedCharacterId(char.id);

    try {
      const response = await fetch('http://localhost:5000/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          selectedCharacter: char.id,
          unlockedCharacters: currentUser.unlockedCharacters,
        }),
      });

      if (!response.ok) throw new Error('서버 업데이트 실패');
      console.log('캐릭터 업데이트 성공');
    } catch (error) {
      console.error('캐릭터 업데이트 중 오류:', error);
    }
  };


  useEffect(() => {
    const CharStudyTime = async () => {
      try {
        const characterRes = await fetch('/data/characters.json');
        const characterData = await characterRes.json();
        setCharacters(characterData);

        let selectedChar = [];

        if (!userId) {
          selectedChar = characterData.find(char => char.id === 'lemon');
        } else {
          const userRes = await fetch('/data/user.json');
          const users = await userRes.json();
          const currentUser = users.find(user => user.userId === userId);

          if (currentUser) {
            selectedChar = characterData.find(char => char.id === currentUser.selectedCharacter);
          }
        }

        if (selectedChar) {
          setCharacterImage(`/img/${selectedChar.image}`);
          setCharacterAlt(selectedChar.name);
          setSelectedCharacterId(selectedChar.id);
          setCharacterDescription(selectedChar.description);
        }
      } catch (error) {
        console.error('데이터를 불러오는 중 오류:', error);
      }
    };

    CharStudyTime();
  }, [userId]);


  useEffect(() => {
    if (!currentUser || characters.length === 0) return;

    const unlockCount = Math.floor(accumulatedTime / 108000);
    const lastUnlockCount = currentUser._lastUnlockCount ?? 0;
    const newUnlocks = unlockCount - lastUnlockCount;

    if (newUnlocks <= 0) return;

    const unlockedSet = new Set(currentUser.unlockedCharacters);
    const lockedCharacters = characters.filter(char => !unlockedSet.has(char.id));

    if (lockedCharacters.length === 0) return;

    const newChars = lockedCharacters.slice(0, Math.min(newUnlocks, lockedCharacters.length));
    if (newChars.length === 0) return;

    const newCharIds = newChars.map(char => char.id);
    const updatedUnlocked = [...currentUser.unlockedCharacters, ...newCharIds];

    const updatedUser = {
      ...currentUser,
      unlockedCharacters: updatedUnlocked,
      _lastUnlockCount: unlockCount,
    };

    setCurrentUser(updatedUser);

    fetch('http://localhost:5000/update-unlocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.userId,
        unlockedCharacters: updatedUnlocked,
        _lastUnlockCount: unlockCount,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`업데이트 실패: ${res.status} ${text}`);
        }
        const names = newChars.map(c => c.name).join(', ');
        setUnlockedNames(names);
        setUnlockModalOpen(true);
      })
      .catch(err => console.error('서버 반영 중 오류:', err));

  }, [accumulatedTime, currentUser, characters]);


  return (
    <div className="container">
      <h2 className='charText'>나의 캐릭터</h2>
      <div className='Mycharacter'>
        <div className='circle'>
          {characterImage ? (
            <img src={characterImage} alt={characterAlt} className="charProfile" />
          ) : (
            <p>캐릭터 로딩 중...</p>
          )}
        </div>
        <div className='charExplain' onClick={handleOpen}>
          <img src='img/charExplain.svg' alt='캐릭터 설명' />
        </div>
      </div>
      <div className="viewBtn">
        <img className='triBtn' src="img/triangle.svg" alt="보기 옵션" />
        <Select
          name="status"
          className="viewSelect"
          aria-label="Project status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">전체목록</option>
          <option value="unlocked">해금항목</option>
          <option value="locked">잠금항목</option>
        </Select>
      </div>
      <div className='charBoxs'>
        {filteredCharacters.map((char, index) => {
          const isLocked = !unlockedIds.includes(char.id);
          return (
            <div
              key={index}
              className="charBox"
              id={char.id}
              onClick={() => {
                if (isLocked) {
                  setLockedCharModalOpen(true);
                  return;
                }
                setSelectedCharacterId(char.id);
                setCharacterImage(`/img/${char.image}`);
                setCharacterAlt(char.name);
                handleCharacterSelect(char)
              }}
              style={{
                border: char.id === selectedCharacterId ? '2px solid orange' : 'none',
                padding: '5px',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                filter: isLocked ? 'grayscale(100%)' : 'none',
              }}
            >
              <img
                src={`/img/${char.image}`}
                alt={char.name}
                className="char"
                style={{ filter: isLocked ? 'grayscale(100%)' : 'none' }}
              />
            </div>
          );
        })}
      </div>
      {showModal && (
        <Modal version="top" onClose={handleClose}>
          <div className='characterBox'>
            <p className='characterName'>{characterAlt}</p>
            <img className='characterImage'
              src={characterImage}
              alt='캐릭터 설명 확대'
              style={{ width: '200px', height: '200px' }}
            />
            <div className='characterDescription'>
              {characterDescription}
            </div>
          </div>
        </Modal>
      )}
      {lockedCharModalOpen && (
        <Modal size="small" version="top" onClose={() => setLockedCharModalOpen(false)}>
          <p style={{ textAlign: 'center', margin: '20px 0' }}>아직 잠겨있습니다.</p>
        </Modal>
      )}
      {unlockModalOpen && (
        <Modal size="small" version="top" onClose={() => setUnlockModalOpen(false)}>
          <p style={{ textAlign: 'center', margin: '20px 0' }}>
            {unlockedNames} 캐릭터가 새로 해금되었습니다!
          </p>
        </Modal>
      )}
      <BottomBar />
    </div>
  );
}

export default Inventory;