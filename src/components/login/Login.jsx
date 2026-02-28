/**
 * 登录/注册组件
 * 
 * 功能：
 * - 用户登录（邮箱 + 密码）
 * - 用户注册（用户名 + 邮箱 + 密码）
 * - 注册时自动创建 Firestore 用户文档和用户聊天列表
 */
import { useState } from 'react'
import './login.css'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

const Login = () => {
    // [局部 State] 加载状态
    const [loading, setLoading] = useState(false)

    /**
     * 用户登录
     * [用户点击登录按钮] -> [Firebase Auth 验证]
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            // [Firebase Auth] 用户登录验证
            // [用户输入邮箱密码] -> [验证通过/失败]
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * 用户注册
     * [用户点击注册按钮] -> [Firebase Auth 创建用户 + Firestore 创建文档]
     */
    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)
        const { username, email, password } = Object.fromEntries(formData)

        try {
            // [Firebase Auth] 创建新用户
            // [用户提交注册表单] -> [创建 Firebase Auth 用户]
            const res = await createUserWithEmailAndPassword(auth, email, password)

            // [Firebase Firestore] 创建用户文档
            // [用户注册成功] -> [创建 Firestore: users 集合文档]
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                blocked: [], // 拉黑列表初始化为空数组
            });

            // [Firebase Firestore] 初始化用户聊天列表
            // [用户注册成功] -> [创建 Firestore: userchats 集合文档]
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [], // 聊天列表初始化为空数组
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
            {/* 登录表单 */}
            <div className="item">
                <h2>欢迎回来，</h2>
                <form onSubmit={handleLogin} >
                    <input type="text" placeholder="邮箱" name="email" />
                    <input type="password" placeholder="密码" name="password" />
                    <button disabled={loading}>{loading ? "加载中" : "登录"}</button>
                </form>
            </div>

            <div className="separator"></div>

            {/* 注册表单 */}
            <div className="item">
                <h2>创建账号</h2>
                <form onSubmit={handleRegister}>
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
