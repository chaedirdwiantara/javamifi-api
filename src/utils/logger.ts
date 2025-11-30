/**
 * Simple console logger with timestamps and colors
 */
class Logger {
    private getTimestamp(): string {
        return new Date().toISOString();
    }

    info(message: string, ...args: any[]): void {
        console.log(`[${this.getTimestamp()}] ℹ️  INFO:`, message, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`[${this.getTimestamp()}] ❌ ERROR:`, message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[${this.getTimestamp()}] ⚠️  WARN:`, message, ...args);
    }

    success(message: string, ...args: any[]): void {
        console.log(`[${this.getTimestamp()}] ✅ SUCCESS:`, message, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.getTimestamp()}] 🐛 DEBUG:`, message, ...args);
        }
    }
}

export const logger = new Logger();
export default logger;
