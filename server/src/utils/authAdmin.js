import bcrypt from "bcrypt";
import {admins} from "../db/db.js";
import process from "node:process"

export async function initAdmin() {
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let admin = admins.find(a => a.name === adminName);

    if (!admin) {
        const hash = await bcrypt.hash(adminPassword, 12);
        admin = { name: adminName, password: hash };
        admins.push(admin);
        console.log("Админ создан:", adminName);
    }

    return admin;
}