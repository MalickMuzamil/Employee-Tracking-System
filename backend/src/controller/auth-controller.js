import { findUserByEmail, createUser } from "../services/auth-service.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import AccessController from "./access-controller.js";

class AuthController {

    static async signup(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password)
                return AccessController.send(res, 400, "All fields required");

            const userExists = await findUserByEmail(email);
            if (userExists)
                return AccessController.send(res, 400, "Email already exists");

            const hashed = await hashPassword(password);
            await createUser(name, email, hashed);

            return AccessController.send(res, 201, "Signup successful");

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await findUserByEmail(email);
            if (!user)
                return AccessController.send(res, 404, "User not found");

            const match = await comparePassword(password, user.password);
            if (!match)
                return AccessController.send(res, 400, "Invalid credentials");

            const token = AccessController.generateToken({
                id: user.id,
                email: user.email
            });

            return AccessController.send(
                res,
                200,
                "Login successful",
                { id: user.id, name: user.name, email: user.email },
                token
            );

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }
}

export default AuthController;
