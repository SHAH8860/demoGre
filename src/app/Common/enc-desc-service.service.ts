import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncDescServiceService {
  secretKey = '37ZA3D89B64C115122DF9178C8R99c1x';
  private keyMain = '37ZA3D89B64C115122DF9178C8R99c1x';
  private initVector = '213A26DBB4A358C5';
  public static SHA512Enc(message: string): string {
    const hash = CryptoJS.SHA512(message);
    return hash.toString(CryptoJS.enc.Hex);
  }

  public static MD5(input: string): string {
    const hash = CryptoJS.MD5(input);
    return hash.toString(CryptoJS.enc.Hex);
  }

  public static SHA512_MD5(message: string): string {
    const msg = this.SHA512Enc(this.MD5(message));
    return msg;
  }
  constructor() {}

  encrypt(plainObject: any): any {
    try {
      const jsonString = JSON.stringify(plainObject);

      const key = CryptoJS.enc.Utf8.parse(this.keyMain);
      const iv = CryptoJS.enc.Utf8.parse(this.initVector);

      const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed', error);
      return null;
    }
  }

  encrypt2(plainObject: any): any {
    try {
      // const jsonString = JSON.stringify(plainObject);

      const key = CryptoJS.enc.Utf8.parse(this.keyMain);
      const iv = CryptoJS.enc.Utf8.parse(this.initVector);

      const encrypted = CryptoJS.AES.encrypt(plainObject, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed', error);
      return null;
    }
  }

  decrypt(encryptedText: any): any {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.keyMain);
      const iv = CryptoJS.enc.Utf8.parse(this.initVector);

      const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed', error);
    }
  }
}
