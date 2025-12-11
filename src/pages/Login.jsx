import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthAPI from '../service/AuthAPI';
import { useCart } from '../context/CartContext';
import CartAPI from '../service/CartAPI';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { cart, setUserId, setCart, setCartCount } = useCart();
    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
    }, [navigate]);
  const handleLogin = async () => {
    setError(''); // Xóa lỗi cũ
    setIsLoading(true);
    
    try {
      const loginResponse = await AuthAPI.login({email, password})
      console.log('loginResponse', loginResponse);
      
      // Kiểm tra nếu có lỗi trong response
      if (loginResponse.error) {
        setError(loginResponse.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }
      
      // Kiểm tra loginResponse có dữ liệu không
      if (loginResponse && loginResponse.token) {
        console.log('Đăng nhập thành công');
        localStorage.setItem('token', loginResponse.token)
        localStorage.setItem('user', JSON.stringify(loginResponse.user))
        setUserId(loginResponse.user.id);
        const payload = {
          user_id: loginResponse.user.id,
          action: 'merge',
          local_cart: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            variation_id: item.variationId,
          })),
        }
        const response = await CartAPI.mergeCart(payload);
        if (response) {
          const responseCart = await CartAPI.getCart(loginResponse.user.id);
          setCart(responseCart.productList || []);
          localStorage.setItem('cart', JSON.stringify([]))
          setCartCount(responseCart.productList.length);

        }
        console.log('Cart sau khi merge', response);
        if (response.error) {
          setError(response.error || 'Merge cart thất bại. Vui lòng thử lại.');
          setIsLoading(false);
          return;
        }
        navigate('/')
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <section className='login-page mt-10'>
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="col-span-1 flex-col">
                <h3 className='text-2xl font-medium uppercase'>Đăng nhập</h3>
                {error && (
                    <div className='mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm'>
                        {error}
                    </div>
                )}
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder='Email' className='w-full mt-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md ' />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Mật khẩu' className='w-full mt-6 py-2 px-3 font-light text-sm outline-none focus:shadow-[inset_0_1px_1px_rgba(0,0,0,.075),0_0_8px_rgba(102,175,233,.6)] border border-gray-300 rounded-md' />
                <button 
                    onClick={handleLogin} 
                    disabled={isLoading}
                    className='mt-6 py-2.5 px-4 uppercase text-sm font-light bg-brand-purple text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
            </div>
            <div className="col-span-1 flex-col">
                <h3 className='text-2xl font-medium text-[#333333]'>Bạn chưa có tài khoản</h3>
                <p className='text-[#777777] mt-6 text-[14px]'>Đăng ký tài khoản ngay để có thể mua hàng nhanh chóng và dễ dàng hơn! Ngoài ra còn có rất nhiều chính sách và ưu đãi cho các thành viên</p>
                <button 
                    onClick={() => navigate('/register')}
                    className='mt-6 py-2.5 px-4 uppercase text-xs font-light bg-[#d9534f] text-white rounded-full'
                >
                    Đăng ký
                </button>
            </div>
        </div>
        
    </section>
  )
}

export default Login