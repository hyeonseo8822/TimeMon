import './css/inventory.css'
import BottomBar from '../component/BottomBar';
function Inventory() {
  return (
     <div className="container">
      <h2>인벤토리 페이지</h2>
      {/* 인벤토리 기능 구현 */}
      <BottomBar/>
    </div>
  );
}

export default Inventory;
