const roleService = require("../services/roleService");

exports.createRole = async (req, res, next) => {
    try {
        const { role_name } = req.body;

        const role = await roleService.createRole(role_name);

        res.status(201).json({
            success: true,
            data: role
        });

    } catch (error) {
        next(error);
    }
};


exports.getRoles = async (req, res, next) => {
    try {

        const roles = await roleService.getRoles();

        res.json({
            success: true,
            data: roles
        });

    } catch (error) {
        next(error);
    }
};