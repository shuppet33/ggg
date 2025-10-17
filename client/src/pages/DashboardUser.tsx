import {useContext, useEffect, useState} from "react";
import styled, {createGlobalStyle, keyframes} from "styled-components";
import {AuthContext} from "../context/AuthContext.tsx";
import {socket} from "../App.tsx";
import {type FieldValues, useForm} from "react-hook-form";

export type VisibleTask = {
    title: string;
    description: string;
    hint?: string;
} | null;

type FormData = {
    code: string;
};

// ====================== Глобальные стили ======================
const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #01060f;
    --accent: #00ffcc;
    --accent2: #00b3ff;
    --text: #e6fff9;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bg);
    font-family: 'JetBrains Mono', monospace;
    color: var(--text);
    overflow-x: hidden;
  }
`;

// ====================== Анимации ======================
const flicker = keyframes`
  0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.6; }
`;

const glow = keyframes`
  from { text-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent2); }
  to { text-shadow: 0 0 15px var(--accent), 0 0 30px var(--accent2); }
`;

// ====================== Стили ======================
const Wrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin-bottom: 12px;
  color: var(--accent);
  animation: ${glow} 2s ease-in-out infinite alternate;
  text-align: center;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: var(--accent);
    color: #000;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 20px;
  width: 100%;
  max-width: 480px;

  @media (min-width: 768px) {
    max-width: 700px;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const TaskCard = styled.div<{ $active: boolean }>`
  background: rgba(0, 255, 153, ${({ $active }) => ($active ? 0.08 : 0.02)});
  border: 1px ${({ $active }) => ($active ? "solid" : "dashed")} var(--accent);
  color: ${({ $active }) => ($active ? "var(--accent)" : "#777")};
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.9rem;
  cursor: ${({ $active }) => ($active ? "pointer" : "not-allowed")};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: all 0.3s ease;
  box-shadow: ${({ $active }) =>
    $active
        ? "0 0 10px rgba(0,255,204,0.3), inset 0 0 5px rgba(0,255,153,0.15)"
        : "none"};
  animation: ${({ $active }) => ($active ? flicker : "none")} 3s infinite;

  &:hover {
    transform: ${({ $active }) => ($active ? "scale(1.03)" : "none")};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: rgba(0, 10, 20, 0.9);
  border: 1px solid var(--accent2);
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 360px;
  position: relative;
  box-shadow: 0 0 25px rgba(0, 179, 255, 0.3);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  transition: 0.2s;

  &:hover {
    color: var(--accent2);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 6px;
  border: 1px solid var(--accent2);
  background: #000;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 6px var(--accent2);
  }
`;

const SubmitButton = styled.button`
  padding: 10px;
  border-radius: 6px;
  border: none;
  background: var(--accent);
  color: #000;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: var(--accent2);
    color: #fff;
  }
`;

const FinishText = styled.div`
  text-align: center;
  color: var(--accent);
  font-size: 1.2rem;
  margin-top: 10px;
`;


// ====================== КОМПОНЕНТ ======================
export const DashboardUser = () => {
    const [tasks, setTasks] = useState<(VisibleTask | null)[]>(Array(6).fill(null));
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const { logout } = useContext(AuthContext);

    const { register, handleSubmit, reset, setError, clearErrors, formState: { errors } } = useForm<FormData>();

    const codeValidation = {
        required: "Поле обязательно",
        minLength: { value: 3, message: "Минимум 3 символа" },
        maxLength: { value: 20, message: "Максимум 20 символов" },
        pattern: {
            value: /^[a-zA-Z0-9-_]+$/, // разрешаем только буквы, цифры, дефис и подчёркивание
            message: "Недопустимые символы"
        }
    };

    useEffect(() => {

        socket.on('user_info', (data: { name: string }) => {
            setUserName(data.name);
        });


        socket.on("sync_state", (state: { tasks: VisibleTask[]; activeIndex: number }) => {
            setTasks(state.tasks);
            setActiveIndex(state.activeIndex);
        });

        socket.on("game_started", (data: { message: string }) => {
            alert(data.message);
            setActiveIndex(0);
        });

        socket.on("location_open", (data: { index: number; task: VisibleTask }) => {
            setTasks((prev) => {
                const newTasks = [...prev];
                newTasks[data.index] = data.task;
                return newTasks;
            });
            setActiveIndex(data.index);
        });

        socket.on("team:update", (data: { currentTaskIndex: number; nextHint: string }) => {
            setActiveIndex(data.currentTaskIndex);

            setTasks(prev => {
                const newTasks = [...prev];
                newTasks[data.currentTaskIndex] = { title: `Локация ${data.currentTaskIndex + 1}`, description: data.nextHint };
                return newTasks;
            });

            alert(`Код верный! Следующая локация доступна: ${data.nextHint}`);
        });

        socket.on("team:finished", () => {
            setIsModalOpen(false);
            setIsFinishModalOpen(true);
        });

        return () => {
            socket.off('user_info');
            socket.off("sync_state");
            socket.off("game_started");
            socket.off("location_open");
            socket.off("team:update");
            socket.off("team:finished");
        };
    }, []);

    const onSubmit = (data: FormData) => {
        if (activeIndex === null) return;


        socket.emit("submit_code", { code: data.code }, (response: { success: boolean; message: string }) => {
            if (!response.success) {
                setError("code", { type: "server", message: response.message });
            } else {
                clearErrors("code");
                reset();
                setIsModalOpen(false);
            }
        });
    };

    return (
        <>
            <GlobalStyle />
            <Wrapper>
                <Title>Команда --- {userName || "USER"}!</Title>
                <LogoutButton onClick={logout}>Выйти</LogoutButton>

                <Grid>
                    {tasks.map((task, i) => {
                        const isActive = i === activeIndex || task !== null;
                        return (
                            <TaskCard
                                key={i}
                                $active={isActive}
                                onClick={() => {
                                    if (isActive && task) setIsModalOpen(true);
                                }}
                            >
                                {task ? task.title : "Локация закрыта"}
                            </TaskCard>
                        );
                    })}
                </Grid>
            </Wrapper>

            {isModalOpen && activeIndex !== null && (
                <ModalOverlay>
                    <Modal>
                        <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
                        <h3>{tasks[activeIndex]?.title}</h3>
                        <p>{tasks[activeIndex]?.hint}</p>

                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                {...register("code", codeValidation)}
                                placeholder="Введите код для локации"
                            />

                            <p style={{ color: "red", fontSize: "0.8rem" }}>
                                {errors.code?.message}
                            </p>

                            <SubmitButton type="submit">Отправить</SubmitButton>
                        </Form>
                    </Modal>
                </ModalOverlay>
            )}

            {isFinishModalOpen && (
                <ModalOverlay>
                    <Modal>
                        <CloseButton onClick={() => setIsFinishModalOpen(false)}>&times;</CloseButton>
                        <FinishText>🎉 Вы всё прошли!</FinishText>
                        <p style={{ textAlign: "center", color: "#ccc" }}>Вернитесь в стартовую точку для финала квеста.</p>
                    </Modal>
                </ModalOverlay>
            )}
        </>
    );
};
