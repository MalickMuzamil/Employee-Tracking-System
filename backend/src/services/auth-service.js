import db from "../config/db.js";

export const findUserByEmail = async (email) => {
    const [user] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return user[0]; 
};

export const createUser = async (name, email, hashedPassword) => {
    await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
    );
};
