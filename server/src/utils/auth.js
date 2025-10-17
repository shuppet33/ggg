import jwt from "jsonwebtoken";
import {teams} from "../db/db.js";

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Неавторизован: отсутствует токен"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'team') {

            const team = teams.find(t => t.name === decoded.name);

            if (!team) {
                return res.status(401).json({
                    success: false,
                    message: "Команда не найдена"
                });
            }
            req.team = team; // сохраняем объект команды в запросе
        }

        if (decoded.role === 'admin') {
            req.admin = { name: decoded.name };
        }

        next();

    } catch (err) {
        console.error("Ошибка аутентификации:", err);
        return res.status(401).json({
            success: false,
            message: "Недействительный или просроченный токен"
        });
    }
};