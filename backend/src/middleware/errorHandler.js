import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

export default errorHandler;
