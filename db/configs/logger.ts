import * as winston from 'winston';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// eslint-disable-next-line @typescript-eslint/no-shadow
const logFormat = printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, service, error } = info as { level: string; message: string; timestamp: string; service: string; error?: Error };
    let logMessage = `${timestamp || ''} [${service || 'unknown'}] ${level}: ${message}`;
    if (error) logMessage += ` | error: ${error.message}`;
    return logMessage;
});

const defaultLoggerConfig: winston.LoggerOptions = {
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), logFormat),
    transports: [
        new transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
};

const loggerObj = winston.createLogger(defaultLoggerConfig);

class Logger {
    private service: string;

    constructor(service: string) {
        this.service = service;
    }

    log(message: string, level: string = 'info', error?: Error): void {
        loggerObj.log({
            level,
            message,
            service: this.service,
            error: error?.message,
        });
    }

    info(message: string): void {
        this.log(message, 'info');
    }

    error(message: string, error?: Error): void {
        this.log(message, 'error', error);
    }

    debug(message: string): void {
        this.log(message, 'debug');
    }
}

export const defaultLogger = new Logger('defaultService');

export default Logger;
