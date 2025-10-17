import jwt from "jsonwebtoken";
import process from "node:process";
import {admins, gameState, tasks, teams} from "../db/db.js";

export const SetupSocket = (io) => {


    io.on('connection', (socket) => {
        const token = socket.data.token

        if (!token) {
            console.log('Подключение без токена, отключаем');
            return socket.disconnect();
        }

        let payload;

        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            console.log('Неверный или просроченный токен, отключаем');
            return socket.disconnect();
        }

        socket.role = payload.role;
        socket.name = payload.name;


        // Админская логика
        if (socket.role === 'admin') {
            socket.join('admins');
        }

        // Командная логика
        if (socket.role === 'team') {
            const team = teams.find(t => t.name === socket.name);

            if (!team) {
                console.log('Команда не найдена, отключаем');
                return socket.disconnect();
            }

            const visibleTasks = team.order.map((taskId, i) =>
                i <= team.currentTaskIndex
                    ? { title: tasks[taskId].title, description: tasks[taskId].description, hint: tasks[taskId].hint }
                    : null
            );

            socket.emit('sync_state', {
                tasks: visibleTasks,
                activeIndex: team.currentTaskIndex
            });

            socket.team = team;
            socket.join('team:' + team.name);
            socket.join('users');
            console.log(`Команда подключилась: team:${team.name}`);
        }


        socket.on('start_game', () => {
            if (socket.role !== 'admin') {
                return socket.emit('status', { success: false, message: 'Нет прав для старта игры' });
            }

            gameState.started = true;
            console.log('Игра началась админом');

            teams.forEach(team => {
                io.to('team:' + team.name).emit('location_open', {
                    taskIndex: team.currentTaskIndex,
                    task: tasks[team.order[team.currentTaskIndex]] // первая задача
                });
            });

            io.to('users').emit('game_started', { message: 'Игра началась! Первая локация доступна!' });

        });

        socket.on('stop_game', () => {
            if (socket.role !== 'admin') {
                return socket.emit('status', { success: false, message: 'Нет прав для остановки игры' });
            }

            gameState.started = false;
            console.log('Игра остановлена админом');
            io.to('users').emit('game_stopped', { message: 'Игра завершена админом' });
        });


        socket.on('submit_code', (data) => {
            if (socket.role !== 'team') {
                return socket.emit('status', { success: false, message: 'Нет прав для отправки кода' });
            }

            const team = socket.team;

            if (!gameState.started) {
                return socket.emit('status', { success: false, message: 'Квест ещё не начался!' });
            }

            const currentTaskIndex = team.currentTaskIndex;
            const taskId = team.order[currentTaskIndex];
            const task = tasks[taskId];

            if (!task) {
                return socket.emit('status', { success: false, message: 'Задание не найдено' });
            }

            if (task.code !== data.code) {
                return socket.emit('status', { success: false, message: 'Неверный код' });
            }

            team.currentTaskIndex++;

            if (team.currentTaskIndex >= tasks.length) {
                team.finished = true;

                console.log(`Команда ${team.name} прошла квест 🎉`);

                return io.to(`team:${team.name}`).emit('team:finished', {
                    message: 'Вы прошли все локации!',
                });
            } else {
                const nextTaskId = team.order[team.currentTaskIndex];
                const nextTask = tasks[nextTaskId];

                // Отправляем всем участникам команды обновление прогресса
                io.to('team:' + team.name).emit('team:update', {
                    currentTaskIndex: team.currentTaskIndex,
                    nextHint: nextTask?.hint || ''
                });

                socket.emit('status', { success: true, message: 'Код верный!' });
            }
        });


        socket.on('disconnect', () => {
            console.log(`${socket.role} отключился: ${socket.name}`);
        });
    });

}