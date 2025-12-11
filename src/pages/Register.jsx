import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthAPI from '../service/AuthAPI';

const Register = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        setError(''); // Xóa lỗi cũ
        setIsLoading(true);
        
        // Validation cơ bản
        if (!fullName || !email || !password || !phone) {
            setError('Vui lòng điền đầy đủ thông tin.');
            setIsLoading(false);
            return;
        }

        try {
            const registerResponse = await AuthAPI.register({
                fullName,
                email,
                password,
                phone
            });
            console.log('registerResponse', registerResponse);
            
            // Kiểm tra nếu có lỗi trong response
            if (registerResponse.error) {
                setError(registerResponse.error || 'Đăng ký thất bại. Vui lòng thử lại.');
                setIsLoading(false);
                return;
            }
            
            // Kiểm tra registerResponse có dữ liệu không
            if (registerResponse && registerResponse.token) {
                console.log('Đăng ký thành công');
                localStorage.setItem('token', registerResponse.token);
                localStorage.setItem('user', JSON.stringify(registerResponse.user));
                navigate('/');
            } else if (registerResponse && registerResponse.message) {
                // Trường hợp đăng ký thành công nhưng cần xác nhận email
                setError('Đăng ký thành công! Vui lòng đăng nhập.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (err) {
            setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
            console.error('Register error:', err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className='register-page mt-10'>
            <div className="container flex justify-center">
                <div className="w-full max-w-md">
                    <h3 className='text-2xl font-bold uppercase text-center mb-8'>ĐĂNG KÝ TÀI KHOẢN</h3>
                    
                    {error && (
                        <div className='mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm'>
                            {error}
                        </div>
                    )}
                    
                    <input 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        type="text" 
                        placeholder='Họ và tên' 
                        className='w-full mb-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md' 
                    />
                    
                    <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        type="email" 
                        placeholder='Email' 
                        className='w-full mb-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md' 
                    />
                    
                    <input 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        type="password" 
                        placeholder='Mật khẩu' 
                        className='w-full mb-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md' 
                    />
                    
                    <input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        type="tel" 
                        placeholder='Điện thoại' 
                        className='w-full mb-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md' 
                    />
                    
                    <div className="flex justify-center">
                        <button 
                            onClick={handleRegister} 
                            disabled={isLoading}
                            className='py-2.5 px-8 uppercase text-sm font-light bg-brand-purple text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
                        </button>
                    </div>
                    
                    <div className="mt-6 text-center">
                        <p className='text-sm text-[#777777]'>
                            Đã có tài khoản?{' '}
                            <button 
                                onClick={() => navigate('/login')}
                                className='text-brand-purple hover:underline'
                            >
                                Đăng nhập
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Register
