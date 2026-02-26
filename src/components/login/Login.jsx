import { useState } from 'react'
import './login.css'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
const Login = () => {
    // // 注册显示头像
    // const [avatar, setAvatar] = useState({
    //     file: null,
    //     url: '',
    // })
    // const handleAvatar = e => {
    //     console.log(e.target.files[0])
    //     if (e.target.files[0]) {
    //         setAvatar(prev => {
    //             return { ...prev, file: e.target.files[0], url: URL.createObjectURL(e.target.files[0]) }
    //         })
    //     }
    // }

    // suspense
    const [loading, setLoading] = useState(false)

    // 登录验证
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };


    //注册表单提交函数
    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)
        const { username, email, password } = Object.fromEntries(formData)

        try {
            // 头像服务
            // const imgUrl = await upload(avatar.file)
            // 向firebase发送post请求，传递email和password
            const res = await createUserWithEmailAndPassword(auth, email, password)
            // 添加数据到Firestore Database
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                // avatar:imgUrl,
                id: res.user.uid,
                blocked: [],
            });
            // 聊天记录
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });





            toast.success("注册成功！请登录");
        } catch (error) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='login'>
            <div className="item">
<h2>欢迎回来，</h2>
                <form onSubmit={handleLogin} >
                    <input type="text" placeholder="邮箱" name="email" />
                    <input type="password" placeholder="密码" name="password" />
                    <button disabled={loading}>{loading ? "加载中" : "登录"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
<h2>创建账号</h2>
                <form onSubmit={handleRegister}>
                    {/* 头像上传功能 */}
                    {/* <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an image
                    </label>
                    <input
                        type="file"
                        id="file"
                        style={{ display: "none" }}
                        onChange={handleAvatar}
                    /> */}
                    <input type="text" placeholder="用户名" name="username" />
                    <input type="text" placeholder="邮箱" name="email" />
                    <input type="password" placeholder="密码" name="password" />
                    <button disabled={loading}>{loading ? "加载中" : "注册"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login