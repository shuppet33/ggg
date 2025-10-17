import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import {socket} from "../App.tsx";
import {type SubmitHandler, useForm} from "react-hook-form";
import axios from "axios";



export type StateGameType = 'start' | 'stop'
export type DataTeamType = {
    teamName: string,
    password: ''
}

export const DashboardAdmin = () => {
    const [stateGame, setStateGame] = useState<StateGameType>('stop')
    const [dataTeam, setDataTeam] = useState<DataTeamType>({teamName: '', password: ''})
    const {role, logout} = useContext(AuthContext)

    const {
        register,
        handleSubmit
    } = useForm()

    useEffect(() => {
        if (stateGame === 'start') {
            socket.emit('start_game', role);
        }
    }, [stateGame]);

    const onSubmit: SubmitHandler<any> = async (data) => {
        try {
            const res = await axios.post(
                'http://localhost:5002/api/admin/register',
                { name: data.teamName },
                { withCredentials: true }
            );
            if (res.data.success) {
                setDataTeam({ teamName: res.data.team.name, password: res.data.team.password });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>ADMIN Dashboard <br/>
        <button onClick={() => logout()}>Выйти</button> <br/>
        <button onClick={() => stateGame === 'start' ? setStateGame('stop') : setStateGame('start')}> {stateGame} </button> <br/> <br/>

            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" {...register('teamName')}/> <br/>
                    <button> Регистрация команды </button> <br/> <br/>

                    <div> Навание команды: {dataTeam.teamName} </div> <br/>
                    <div> Пароль: {dataTeam.password} </div> <br/>

                </form>
            </div> <br/> <br/>

            <button> тест</button>

        </div>
    )
}