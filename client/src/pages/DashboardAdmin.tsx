import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import {socket} from "../App.tsx";
import {type SubmitHandler, useForm} from "react-hook-form";
import axios from "axios";
import styled, { keyframes } from "styled-components";

export type StateGameType = 'start' | 'stop';
export type DataTeamType = {
    teamName: string;
    password: '';
};

export const DashboardAdmin = () => {
    const [stateGame, setStateGame] = useState<StateGameType>('stop');
    const [dataTeam, setDataTeam] = useState<DataTeamType>({ teamName: '', password: '' });
    const { role, logout } = useContext(AuthContext);

    const { register, handleSubmit } = useForm();

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
        <Wrapper>
            <MatrixBackground />
            <Container>
                <Title>ADMIN DASHBOARD</Title>

                <Buttons>
                    <Button onClick={() => logout()}>Выйти</Button>
                    <Button
                        active={stateGame === 'start'}
                        onClick={() => setStateGame(stateGame === 'start' ? 'stop' : 'start')}
                    >
                        {stateGame === 'start' ? 'Остановить игру' : 'Запустить игру'}
                    </Button>
                </Buttons>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Label>Название команды</Label>
                    <Input type="text" {...register('teamName')} placeholder="Введите название..." />
                    <Button type="submit">Регистрация команды</Button>

                    {dataTeam.teamName && (
                        <TeamInfo>
                            <p><strong>Команда:</strong> {dataTeam.teamName}</p>
                            <p><strong>Пароль:</strong> {dataTeam.password}</p>
                        </TeamInfo>
                    )}
                </Form>
            </Container>
        </Wrapper>
    );
};

/* === STYLES === */

const matrixRain = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 1000px; }
`;

const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: black;
  overflow: hidden;
  color: #00ff9f;
  font-family: "Share Tech Mono", monospace;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MatrixBackground = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    rgba(0, 255, 100, 0.05) 50%,
    transparent 50%
  ),
  linear-gradient(90deg, rgba(0, 255, 100, 0.05) 50%, transparent 50%);
  background-size: 10px 10px;
  animation: ${matrixRain} 10s linear infinite;
  pointer-events: none;
  z-index: 0;
`;

const Container = styled.div`
  z-index: 2;
  background: rgba(0, 20, 0, 0.85);
  border: 2px solid #00ff9f;
  border-radius: 12px;
  padding: 40px;
  width: 420px;
  text-align: center;
  box-shadow: 0 0 20px #00ff9f44;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  text-shadow: 0 0 10px #00ff9f;
  margin-bottom: 25px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  gap: 10px;
`;

const Button = styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>`
    flex: 1;
    background: ${({ active }) => (active ? '#00ff9f' : 'transparent')};
    color: ${({ active }) => (active ? '#000' : '#00ff9f')};
    border: 2px solid #00ff9f;
    border-radius: 6px;
    padding: 10px 15px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;

    &:hover {
        background: #00ff9f;
        color: #000;
        box-shadow: 0 0 10px #00ff9f;
    }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  text-align: left;
  color: #00ff9fcc;
`;

const Input = styled.input`
  background: transparent;
  border: 2px solid #00ff9f;
  color: #00ff9f;
  border-radius: 6px;
  padding: 8px 10px;
  font-family: inherit;

  &::placeholder {
    color: #00ff9f66;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 10px #00ff9f;
  }
`;

const TeamInfo = styled.div`
  margin-top: 20px;
  background: rgba(0, 255, 100, 0.1);
  border-radius: 6px;
  padding: 10px;
  border: 1px solid #00ff9f44;
`;

