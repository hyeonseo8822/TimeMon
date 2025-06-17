import './css/SignUp.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function SignUp() {
    const navigate = useNavigate();
    const [userId, setuserId] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const signUp = async () => {
        try {
            await axios.post('http://localhost:5000/signup', {
                userId,
                password,
                email
            });
            navigate('/Login');
        } catch (err) {
            console.error('회원가입 실패:', err);
        }
    };

    return (
        <div className="container3">
            <div className="character">
                <img src="/img/lemon.svg" alt="레몬이" />
            </div>
            <div className='loginBox'>
                <p className='WelcomeBack'>Sign Up</p>
                <p className='idInputText'>아이디</p>
                <div className='idInput'>
                    <input placeholder="아이디 입력" type='text' value={userId} onChange={(e) => setuserId(e.target.value)} />
                </div>
                <p className='pwInputText'>비밀번호</p>
                <div className='pwInput'>
                    <input  placeholder="비밀번호 입력" type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <p className='emailInputText'>이메일</p>
                <div className='emailInput'>
                    <input  placeholder="이메일 입력"  type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="signUp" onClick={signUp}>회원가입</div>
            </div>
        </div>
    );
}

export default SignUp;
