"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    level;
    constructor() {
        this.level = process.env.LOG_LEVEL || 'info';
    }
    shouldLog(level) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        return levels[level] >= levels[this.level];
    }
    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const levelStr = level.toUpperCase().padEnd(5);
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') : '';
        return `[${timestamp}] ${levelStr} ${message}${formattedArgs}`;
    }
    debug(message, ...args) {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage('debug', message, ...args));
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage('info', message, ...args));
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, ...args));
        }
    }
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, ...args));
        }
    }
}
exports.logger = new Logger();
