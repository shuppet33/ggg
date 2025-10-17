import {type SubmitHandler, useForm} from "react-hook-form";
import {useContext} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import axios from "axios";
import {useNavigate} from "react-router-dom";


export const LoginPage = () => {

    const {login} = useContext(AuthContext);
    const navigate = useNavigate()

    const {
        register,
        handleSubmit
    } = useForm()

    const onSubmit: SubmitHandler<any> = (data) => {
        axios.post('http://localhost:5002/api/login', {
                name: data.name,
                password: data.password
            }, { withCredentials: true })
            .then((res) => {
                if (res.data.success) {
                    const role = res.data.role === 'admin' ? 'admin' : 'user'

                    login(role)
                    localStorage.setItem('role', role)

                    navigate(`/${role}`)
                }
            })
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register('name')} type="text"/> <br/>
                <input {...register('password')} type="password"/> <br/>
                <button type={'submit'}>Войти типо</button>
            </form>
        </div>
    )
}