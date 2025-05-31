
import './css/Timer.css'
import BottomBar from '../component/BottomBar';
import Button from '../component/Button';
function Timer() {

  function sayHello() {
    alert("안녕!");
  }

  return (
    <div className="container">
      <div className="character">
        <img src="/img/lemon.svg" alt="레몬이" />
      </div>

      <div className='timer'>
        <p>00:00:00</p>
      </div>

      <div className='timerBtns'>
        <Button text="시작" bgColor="#C4FF90" onClick={sayHello} />
        <Button text="목표" bgColor="#FFFDC4" onClick={sayHello} />
        <div className='goal'>
        </div>
      </div>

      <div className='goalBar'>
        {/* <div className='goals'><p className='goalText'>국어</p><p>02:00:00</p></div> */}
        <p className='noGoal'>목표가 아직 없습니다.</p>
      </div>

      <BottomBar />
    </div>

  );
}

export default Timer;
