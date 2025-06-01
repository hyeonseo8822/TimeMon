import { useNavigate } from 'react-router-dom';
import './css/App.css';
import BottomBar from '../component/BottomBar';
import StudyBarChart from '../component/StudyBarChart';
function App() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* 캐릭터 이미지 */}
      <div className="character">
        <img src="/img/lemon.svg" alt="레몬이" />
      </div>

      <div className='studyBar'>
        {/* 오늘 공부한 시간 */}
        <div className='studyTimeBar'>
          <p className='timeText'>오늘 공부한 시간</p>
          <h1 className='time'>00:00:00</h1>
        </div>

        {/* 타이머 / 인벤토리 페이지로 이동 버튼 */}
        <div className="pageBar">
          {/* 클릭할 때만 실행하기 위해 콜백함수 사용 */}
          <div className='pageBtns'>
            <div className='clock'>
              <img src='img/Clock.svg' alt='시계' />
              <button className='timerbtn' onClick={() => navigate('/timer')}>타이머</button>
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
        <p className='avgTime'>0시간 0분</p>
        <StudyBarChart />
      </div>
      <BottomBar />
    </div>
  );
}

export default App;