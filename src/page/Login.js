    import './css/Login.css';
    import { useNavigate } from 'react-router-dom';
    import { useState } from 'react';
    import axios from 'axios';
    import Modal from '../component/Modal';

    function Login() {
        const navigate = useNavigate();

        const [userId, setUserId] = useState('');
        const [password, setPassword] = useState('');
        const [showModal, setShowModal] = useState(false);

        const closeModal = () => {
            setShowModal(false);
        };
        const Tologin = async () => {
            try {
                const response = await axios.post('http://localhost:5000/login', {
                    userId,
                    password
                });

                if (response.data.success) {
                    navigate('/');
                    localStorage.setItem('userId', userId);
                } else {
                    setShowModal(true);
                }
            } catch (error) {
                console.error('로그인 실패:', error);
                alert('서버와 연결할 수 없습니다.');
            }
        };

        const signUp = () => {
            navigate('/SignUp');
        };

        return (
            <div className="container3">
                <div className="character">
                    <img src="/img/lemon.svg" alt="레몬이" />
                </div>
                <div className='loginBox'>
                    <p className='WelcomeBack'>Welcome Back</p>
                    <p className='idInputText'>아이디</p>
                    <div className='idInput'>
                        <input placeholder="아이디 입력" type='text' value={userId} onChange={(e) => setUserId(e.target.value)} />
                    </div>
                    <p className='pwInputText'>비밀번호</p>
                    <div className='pwInput'>
                        <input placeholder="비밀번호 입력" type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="loginBtn" onClick={Tologin}>로그인</div>
                    <p className='signUptext' onClick={signUp}>회원가입</p>
                </div>

                {showModal && (
                    <Modal size="small" onClose={closeModal} version='top'>
                        <p className='notLoginText'>아이디 또는 비밀번호가 틀렸습니다.</p>
                    </Modal>
                )}
            </div>
        );
    }

    export default Login;
