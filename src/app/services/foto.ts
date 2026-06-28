import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Foto {
  public photos: UserPhoto[] = [];

  private readonly photoStorage = 'photos';

  public async addNewToGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    await Preferences.set({
      key: this.photoStorage,
      value: JSON.stringify(this.photos),
    });

    return savedImageFile;
  }

  public async loadSaved() {
    const photoList = await Preferences.get({ key: this.photoStorage });
    this.photos = photoList.value ? JSON.parse(photoList.value) : [];

    for (const photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      const data = readFile.data instanceof Blob
        ? await this.convertBlobToBase64(readFile.data)
        : readFile.data;

      photo.webviewPath = `data:image/jpeg;base64,${data}`;
    }

    return this.photos;
  }

  private async savePicture(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);
    const fileName = `${Date.now()}.jpeg`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: `data:image/jpeg;base64,${base64Data}`,
    };
  }

  private async readAsBase64(photo: Photo) {
    if (photo.webPath) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return this.convertBlobToBase64(blob);
    }

    if (photo.path) {
      const file = await Filesystem.readFile({ path: photo.path });

      if (file.data instanceof Blob) {
        return this.convertBlobToBase64(file.data);
      }

      return file.data;
    }

    return '';
  }

  private convertBlobToBase64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }
}
