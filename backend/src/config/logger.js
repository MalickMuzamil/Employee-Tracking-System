import winston from "winston";
import "winston-daily-rotate-file";

const { createLogger, format, transports } = winston;

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "14d"
        }),
        new transports.Console()
    ]
});

export default logger;
