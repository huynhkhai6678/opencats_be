import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ensureDirSync, existsSync } from 'fs-extra';
import { Request } from 'express';
import * as md5 from 'md5';


export function createFileUploadStorage(entity: string) {
  return diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, destination: string) => void,
    ) => {
      try {

        const baseDir = './uploads/site_1';
        const attachmentId = req['attachmentId'];
        const idGroupDir = join(baseDir, `${Math.floor(attachmentId / 1000)}xxx`);

        // Ensure all directories
        ensureDirSync(baseDir);
        ensureDirSync(idGroupDir);

        // Unique directory under ID group
        const uniqueDirName = getUniqueDirectory(idGroupDir, file.originalname);
        const finalPath = join(idGroupDir, uniqueDirName);

        ensureDirSync(finalPath); // Create the final unique directory

        callback(null, finalPath);
      } catch (err) {
        callback(err as Error, '');
      }
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = Date.now() + extname(file.originalname);
      callback(null, file.fieldname + '-' + uniqueSuffix);
    },
  });
}

export function getUniqueDirectory(basePath: string, extraData = ''): string {
  if (!basePath.endsWith('/')) {
    basePath += '/';
  }
  let uniqueName: string;

  do {
    const hash = md5(Math.random().toString() + Date.now().toString() + extraData);
    uniqueName = hash;
  } while (existsSync(join(basePath, uniqueName)));

  return uniqueName;
}
