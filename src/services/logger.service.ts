import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class Logger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Configure the winston logger with file transport
    this.logger = winston.createLogger({
      level: 'info', // Minimum log level
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/%DATE%-combined.log',  // Logs are saved in "logs" folder
          datePattern: 'YYYY-MM-DD',  // Daily log files
          maxSize: '20m',  // Max file size
          maxFiles: '14d',  // Keep log files for 14 days
          level: 'info',  // Log level for the file
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}