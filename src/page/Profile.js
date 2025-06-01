import './css/Profile.css'
import BottomBar from '../component/BottomBar';
function Profile() {
  return (
    <div className="container">
      <div className='rectangle'>
        <img className='profile' src='img/profile.svg' />
      </div>
      <p className='userName'>현서</p>
      <div className='profileEdit'>
        <p className='profileEditText'>프로필 편집</p>
        <img className='PencilSquare' src='img/PencilSquare.svg' />
      </div>
      <div className='Times'>
        <div className='accumulTime'>
          <p className='accumulTimeText'>누적시간</p>
        </div>
        <div className='avgTime2'>
          <p className='avgTime2Text'>평균시간</p>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

export default Profile;
