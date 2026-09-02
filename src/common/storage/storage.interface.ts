export abstract class StorageService {
  abstract upload(file: Express.Multer.File): Promise<string>;
  abstract delete(url: string): Promise<void>;
}
