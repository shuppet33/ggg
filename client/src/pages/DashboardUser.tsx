import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import {socket} from "../App.tsx";
import {type FieldValues, type SubmitHandler, useForm} from "react-hook-form";


export type VisibleTask = {
    title: string;
    description: string;
    hint?: string;
} | null;

type FormData = {
    code: string;
};

export const DashboardUser = () => {

    const [tasks, setTasks] = useState<(VisibleTask | null)[]>(Array(6).fill(null));
    const [activeIndex, setActiveIndex] = useState<number | null>(null); // текущая активная карточка
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { logout } = useContext(AuthContext);

    const { register, handleSubmit, reset } = useForm();



    useEffect(() => {

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


        return () => {
            socket.off("sync_state");
            socket.off("game_started");
            socket.off("location_open");
            socket.off("team:update");
        };
    }, []);

    console.log('LOOOG', activeIndex)

    const onSubmit = (data: FormData) => {
        if (activeIndex === null) return;

        socket.emit("submit_code", { code: data.code }); // отправляем код на сервер
        reset();
        setIsModalOpen(false);
    };


    // @ts-ignore
    return (
        <div style={{ padding: "20px" }}>
            <h2>USER Dashboard</h2>
            <button onClick={logout}>Выйти</button>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "20px" }}>
                {tasks.map((task, i) => {
                    const isActive = i === activeIndex || task !== null;
                    return (
                        <div
                            key={i}
                            style={{
                                width: "180px",
                                minHeight: "120px",
                                borderRadius: "12px",
                                padding: "12px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                backgroundColor: isActive ? "#f0fff0" : "#f5f5f5",
                                border: isActive ? "2px solid #4caf50" : "2px dashed #ccc",
                                cursor: isActive ? "pointer" : "not-allowed",
                                opacity: isActive ? 1 : 0.5,
                                transition: "all 0.3s ease",
                                position: "relative",
                            }}
                            onClick={() => {
                                if (isActive && task) {
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            {task ? task.title : "Локация закрыта"}
                        </div>
                    );
                })}
            </div>

            {/* Модалка */}
            {isModalOpen && activeIndex !== null && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#fff",
                            padding: "20px",
                            borderRadius: "12px",
                            minWidth: "300px",
                            position: "relative",
                        }}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                border: "none",
                                background: "transparent",
                                fontSize: "18px",
                                cursor: "pointer",
                            }}
                        >
                            &times;
                        </button>

                        <h3> {tasks[activeIndex]?.title}</h3>
                        <h3> {tasks[activeIndex]?.hint}</h3>

                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input
                                {...register("code", { required: true })}
                                placeholder="Введите код для локации"
                                style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
                            />
                            <button type="submit" style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#4caf50", color: "#fff", border: "none", cursor: "pointer" }}>
                                Отправить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};