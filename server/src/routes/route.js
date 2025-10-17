import {Router} from "express";
import {admins, gameState, tasks, teams} from "../db/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import {authMiddleware} from "../utils/auth.js";
import {initAdmin} from "../utils/authAdmin.js";

export const router = new Router()



// вход
router.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                success: false,
                message: "Не переданы имя или пароль"
            });
        }

        // Убедимся, что админ создан
        const admin = await initAdmin();

        let payload;
        let token;

        // Проверяем админа первым
        if (name === admin.name) {
            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                return res.json({ success: false, message: "Неверный пароль" });
            }

            payload = { name: admin.name, role: 'admin' };
            token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 30 * 60 * 1000
            });

            return res.json({
                success: true,
                message: "Успешный вход как админ",
                role: 'admin'
            });
        }

        // Проверяем команды
        const team = teams.find(t => t.name === name);
        if (!team) {
            return res.json({ success: false, message: "Пользователь не найден" });
        }

        const match = await bcrypt.compare(password, team.password);
        if (!match) {
            return res.json({ success: false, message: "Неверный пароль" });
        }

        payload = { name: team.name, role: 'team' };
        token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "Успешный вход как команда",
            role: 'team',
            team: {
                name: team.name,
                currentTaskIndex: team.currentTaskIndex
            }
        });

    } catch (error) {
        console.error("Ошибка при логине:", error);
        return res.status(500).json({
            success: false,
            message: "Ошибка при авторизации"
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Выход выполнен' });
});

// админ регистрирует команду (название + пароль)
// админ запускает квест

// админ панель
// регистрация команд
router.post('/admin/register', authMiddleware, async (req, res) => {
    try {
        // ✅ Проверяем по req.admin

        if (!req.admin) {
            return res.status(403).json({ success: false, message: "Нет доступа" });
        }

        const { name } = req.body;

        if (!name || typeof name !== 'string') {
            return res.status(400).json({ success: false, message: "Некорректное имя команды" });
        }

        if (teams.find(team => team.name === name)) {
            return res.json({ success: false, message: "Такая команда уже существует" });
        }

        const passwordPlain = generateRandomPassword(8);
        const passwordHash = await bcrypt.hash(passwordPlain, 12);

        const newTeam = {
            name,
            password: passwordHash,
            order: [0, 1, 2, 3],
            currentTaskIndex: 0,
            finished: false
        };

        teams.push(newTeam);

        return res.json({
            success: true,
            message: "Команда успешно зарегистрирована",
            team: { name: newTeam.name, password: passwordPlain }
        });
    } catch (error) {
        console.error("Ошибка при регистрации команды:", error);
        return res.status(500).json({ success: false, message: "Ошибка при регистрации команды" });
    }
});


// // запустить квест
// router.post('/admin/start', (req, res) => {
//     gameState.started = true;
//     return res.json({ success: true, message: "Квест начался!" });
// })
//
// // остановить квест
// router.post('/admin/stop', (req, res) => {
//     gameState.started = false;
//     return res.json({ success: true, message: "Квест завершен" });
// })

// все команды
router.get('/admin/teams', authMiddleware, (req, res) => {
    if (req.team.role !== 'admin') {
        return res.status(403).json({ success: false, message: "Нет доступа" });
    }
    return res.json({ teams });
});

// игроки входят под названием + пароль на единый акк команды и ждут запуска квеста
// после запуска квеста у игроков открывается 1я локация
// квест прекращается только после того, как ВСЕ команды прошли ВСЕ локации

// команды

// продвижение по локациям
// router.post('/teams/code', authMiddleware, (req, res) => {
//     const { code } = req.body;
//     const team = req.team; // теперь доступно из middleware
//
//     if (!gameState.started) {
//         return res.json({ success: false, message: "Квест ещё не начался!" });
//     }
//
//     if (!code) {
//         return res.status(400).json({
//             success: false,
//             message: "Не передан код."
//         });
//     }
//
//     const currentTaskIndex = team.currentTaskIndex;
//     const taskId = team.order[currentTaskIndex];
//     const task = tasks[taskId];
//
//     if (task.code !== code) {
//         return res.json({
//             success: false,
//             message: "Неверный код, попробуйте ещё раз"
//         });
//     }
//
//     team.currentTaskIndex++;
//
//     if (team.currentTaskIndex >= tasks.length) {
//         team.finished = true;
//         return res.json({
//             success: true,
//             message: "Вы прошли все локации!"
//         });
//     }
//
//     const nextTaskId = team.order[team.currentTaskIndex];
//     const nextTask = tasks[nextTaskId];
//
//     return res.json({
//         success: true,
//         message: "Код верный!",
//         nextTask: { hint: nextTask.hint }
//     });
// });

// состояние игры (запущена или нет)
router.get('/game/state', (req, res) => {
    return res.json({ started: gameState.started });
});









function generateRandomPassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

