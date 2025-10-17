import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import {socket} from "../App.tsx";


type TaskType = {
    title: string;
    description: string;
    hint?: string;
};

export const DashboardUser = () => {

    const [tasks, setTasks] = useState<(TaskType | null)[]>(Array(6).fill(null));
    const [activeIndex, setActiveIndex] = useState<number | null>(null); // текущая активная карточка
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        socket.on("game_started", (data: { message: string }) => {
            alert(data);
            setActiveIndex(0);
        });

        socket.on("location_open", (data: { index: number; task: TaskType }) => {

            console.log('LOOOG', data.index, data.task)

            setTasks((prev) => {
                const newTasks = [...prev];
                newTasks[data.index] = data.task;
                return newTasks;
            });
            setActiveIndex(data.index);
        });

        return () => {
            socket.off("game_started");
            socket.off("location_open");
        };
    }, []);

    console.log('LOOOG', activeIndex)

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
                            }}
                            onClick={() => {
                                if (isActive && task) {
                                    alert(`Задача: ${task.title}\nОписание: ${task.description}${task.hint ? "\nПодсказка: " + task.hint : ""}`);
                                }
                            }}
                        >
                            {task ? task.title : "Локация закрыта"}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};