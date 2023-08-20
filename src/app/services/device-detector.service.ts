import { Injectable } from "@angular/core";
import { Device, DeviceInfo } from "@capacitor/device";

export type DeviceType = "ios" | "android" | "web"

@Injectable({
    providedIn: 'root'
})
export class DeviceDetectorService {

    async detectDevice() {
        return new Promise<DeviceType>(
            (resolve, reject) => {
                const device = Device.getInfo();
                device.then(
                    (dev: DeviceInfo) => {
                        resolve(dev.platform);
                    }
                ).catch(
                    (error) => {
                        reject('Failed to detect device ' + error.toString())
                    }
                )
            }
        )

    }
}