import jwt from "jsonwebtoken";

class AccessController {
    // ============================
    // 📌 Standard API Response
    // ============================
    static send(res, status, message, data = null, token = null) {
        const response = {
            status,
            message
        };

        if (data) response.data = data;
        if (token) response.token = token;

        return res.status(status).json(response);
    }

    // ============================
    // 📌 Generate JWT Token
    // ============================
    static generateToken(payload, expiresIn = "7d") {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    }

    // ============================
    // 📌 Verify JWT Token
    // ============================
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return null; // token invalid or expired
        }
    }
}

export default AccessController;
