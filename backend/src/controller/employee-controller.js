import EmployeeService from "../services/employee-service.js";
import AccessController from "./access-controller.js";
import { posthog } from "../config/posthog.js";

class EmployeeController {

    // ================================
    // GET ALL EMPLOYEES
    // ================================
    static async getAll(req, res) {
        try {
            const employees = await EmployeeService.getAll();

            posthog.capture({
                distinctId: "backend",
                event: "employee_list_fetched",
                properties: { count: employees.length }
            });

            return AccessController.send(res, 200, "Employees fetched", employees);

        } catch (err) {

            posthog.capture({
                distinctId: "backend",
                event: "employee_fetch_failed",
                properties: { error: err.message }
            });

            return AccessController.send(res, 500, err.message);
        }
    }

    // ================================
    // CREATE EMPLOYEE
    // ================================
    static async create(req, res) {
        try {
            const body = req.body;
            const picture = req.file?.filename ?? null;

            const ids = await EmployeeService.getMappedIds(body);

            // Salary removed
            const data = {
                name: body.name,
                email: body.email,
                contact: body.contact,
                address: body.address,
                gender: body.gender,
                picture,
                ...ids
            };

            const insertId = await EmployeeService.create(data);

            posthog.capture({
                distinctId: "backend",
                event: "employee_created_backend",
                properties: { id: insertId, name: body.name }
            });

            return AccessController.send(res, 201, "Employee created", { id: insertId });

        } catch (err) {

            posthog.capture({
                distinctId: "backend",
                event: "employee_create_failed",
                properties: { error: err.message }
            });

            return AccessController.send(res, 500, err.message);
        }
    }

    // ================================
    // UPDATE EMPLOYEE
    // ================================
    static async update(req, res) {
        try {
            const id = req.params.id;
            const body = req.body;
            const picture = req.file?.filename ?? null;

            const ids = await EmployeeService.getMappedIds(body);

            const data = {
                name: body.name,
                email: body.email,
                contact: body.contact,
                address: body.address,
                gender: body.gender,
                ...ids
            };

            if (picture) data.picture = picture;

            const affected = await EmployeeService.update(id, data);

            posthog.capture({
                distinctId: "backend",
                event: "employee_updated_backend",
                properties: { id, name: body.name }
            });

            return AccessController.send(res, 200, "Employee updated", { affected });

        } catch (err) {

            posthog.capture({
                distinctId: "backend",
                event: "employee_update_failed",
                properties: { error: err.message }
            });

            return AccessController.send(res, 500, err.message);
        }
    }

    // ================================
    // DELETE EMPLOYEE (Soft Delete)
    // ================================
    static async remove(req, res) {
        try {
            const id = req.params.id;

            const affected = await EmployeeService.delete(id);

            posthog.capture({
                distinctId: "backend",
                event: "employee_deleted_backend",
                properties: { id }
            });

            return AccessController.send(res, 200, "Employee deleted", { affected });

        } catch (err) {

            posthog.capture({
                distinctId: "backend",
                event: "employee_delete_failed",
                properties: { error: err.message }
            });

            return AccessController.send(res, 500, err.message);
        }
    }
}

export default EmployeeController;
