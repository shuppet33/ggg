import { useContext, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AuthContext } from "../context/AuthContext.tsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";

// ====================== Глобальные стили ======================
const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #01060f;
    --accent: #00ffcc;
    --accent2: #00b3ff;
    --text: #e6fff9;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background-color: var(--bg);
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    overflow-x: hidden;
    height: 100%;
  }
`;

// ====================== Анимации ======================
const glow = keyframes`
  from { text-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent2); }
  to { text-shadow: 0 0 20px var(--accent), 0 0 40px var(--accent2); }
`;

const flicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.7; }
`;

// ====================== Стили ======================
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
  padding: 16px;
`;

const Title = styled.h1`
  color: var(--accent);
  font-size: 1.8rem;
  margin-bottom: 24px;
  animation: ${glow} 2s ease-in-out infinite alternate;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(0, 20, 40, 0.8);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--accent2);
  box-shadow: 0 0 25px rgba(0, 179, 255, 0.2);
  width: 100%;
  max-width: 340px;
  animation: ${flicker} 4s infinite;
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: rgba(0, 0, 0, 0.8);
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  transition: 0.3s;

  &:focus {
    outline: none;
    box-shadow: 0 0 10px var(--accent2);
    border-color: var(--accent2);
  }
`;

const Button = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: var(--accent2);
    color: #fff;
    box-shadow: 0 0 10px var(--accent2);
  }
`;

const Hint = styled.p`
  color: #888;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 10px;
`;

type FormData = {
    name: string;
    password: string;
};

// ====================== КОМПОНЕНТ ======================
export const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setServerError(null);
        try {
            const res = await axios.post(
                "http://localhost:5002/api/login",
                {
                    name: data.name,
                    password: data.password,
                },
                { withCredentials: true }
            );

            if (!res.data.success) {
                // сервер вернул ошибку
                setError("password", { type: "server", message: res.data.message });
                return;
            }

            clearErrors();
            const role = res.data.role === "admin" ? "admin" : "user";
            login(role);
            localStorage.setItem("role", role);
            navigate(`/${role}`);
        } catch (err: any) {
            setServerError("Ошибка сервера, попробуйте позже");
        }
    };

    const nameValidation = {
        required: "Имя команды обязательно",
        minLength: { value: 3, message: "Минимум 3 символа" },
        maxLength: { value: 20, message: "Максимум 20 символов" },
        pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: "Только буквы, цифры и _",
        },
    };

    const passwordValidation = {
        required: "Пароль обязателен",
        minLength: { value: 4, message: "Минимум 4 символа" },
        maxLength: { value: 20, message: "Максимум 20 символов" },
        pattern: {
            value: /^[a-zA-Z0-9!@#$%^&*]+$/,
            message: "Недопустимые символы",
        },
    };

    return (
        <>
            <GlobalStyle />
            <Wrapper>
                <Title>Вход в систему</Title>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Input {...register("name", nameValidation)} placeholder="Имя команды" />
                    <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>
                        {errors.name?.message}
                    </p>

                    <Input {...register("password", passwordValidation)} type="password" placeholder="Пароль" />
                    {<p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>
                        {errors.password?.message || serverError}
                    </p>}

                    <Button type="submit">Войти</Button>
                </Form>
                <Hint>Введите данные, выданные организатором квеста</Hint>
            </Wrapper>
        </>
    );
};
