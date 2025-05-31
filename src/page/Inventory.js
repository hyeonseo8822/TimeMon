import './css/inventory.css'
import BottomBar from '../component/BottomBar';
import { Select } from '@headlessui/react'
function Inventory() {
  const boxCnt = 10;
  const boxes = [];
  for (let i = 0; i < boxCnt; i++) {
    boxes.push(i);
  }

  return (
    <div className="container">
      <h2 className='charText'>나의 캐릭터</h2>
      <div className='Mycharacter'>
        <div className='circle'>
          <img className='circleChar' src='img/lemon.svg' />
        </div>
        <div className='charExplain'>
          <img src='img/charExplain.svg' />
        </div>
      </div>
      <div className="viewBtn">
        <img className='triBtn' src="img/triangle.svg" alt="보기 옵션" />
        <Select name="status" className="viewSelect" aria-label="Project status">
          <option value="all">전체목록</option>
          <option value="unlocked">해금항목</option>
          <option value="locked">잠금항목</option>
        </Select>
      </div>
      <div className='charBoxs'>
        {/* _ : 값을 무시 */}
        {boxes.map((_, index) => (
          <div key={index} className="charBox"></div>
        ))}
      </div>
      <BottomBar />
    </div>
  );
}

export default Inventory;