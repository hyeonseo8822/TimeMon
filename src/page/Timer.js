import './css/Timer.css'
import BottomBar from '../component/BottomBar';
function Timer() {
  return (
    <div className="container">
      <div className="character">
        <img src="/img/lemon.svg" alt="레몬이" />
      </div>
      <div className='timer'>
        <p>00:00:00</p>
      </div>
      <div className='timerBtns'>
        <img src='/img/start.svg'></img>
        <img src='/img/goal.svg'></img>
      </div>
      <div className='goalBar'>
        {/*<div className='goals'><p className='goalText'>국어</p><p>02:00:00</p></div>*/}
        <p className='noGoal'>목표가 아직 없습니다.</p>
      </div>
      <BottomBar />
    </div>
  );
}

export default Timer;
