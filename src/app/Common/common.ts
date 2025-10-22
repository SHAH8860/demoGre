import * as CryptoJS from 'crypto-js';

export class Common {


	

	public static SHA512_MD5(message: string): string {
		const msg = this.SHA512(message);
		return msg;
	  }

	public static SHA512(message: string): string {
		const hash = CryptoJS.SHA512(message);
		return hash.toString(CryptoJS.enc.Hex);
	  }
		public static encWithSHAH(message: string): string {
					const md5Hash = CryptoJS.MD5(message).toString(CryptoJS.enc.Hex);
					return CryptoJS.SHA512(md5Hash).toString(CryptoJS.enc.Hex);			
		}
	
}