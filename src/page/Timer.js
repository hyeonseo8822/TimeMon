import './css/Timer.css'
import BottomBar from '../component/BottomBar';
function Timer() {
  return (
    <div className="container">
      <h2>타이머 페이지</h2>
      {/* 타이머 기능 구현 */}
      <BottomBar/>
    </div>
  );
}

export default Timer;
