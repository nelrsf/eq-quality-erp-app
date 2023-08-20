import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faCameraRotate, faCheck, faClose, faImages, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { CommonModule } from '@angular/common';
import { FileService } from 'src/app/services/file.service';
import { LoadingComponent } from '../loading/loading.component';
import { Camera, GalleryPhoto } from '@capacitor/camera';

@Component({
    selector: 'eq-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule,
        FileUploaderComponent,
        LoadingComponent
    ]
})
export class CameraComponent implements AfterViewInit, OnDestroy {

    @ViewChild('cameraFeed') cameraFeedRef!: ElementRef<HTMLVideoElement>;
    @ViewChild('photoCanvas') photoCanvasRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('cameraModal') cameraModal!: ElementRef;
    @Output() dissmiss = new EventEmitter<void>();

    currentCamera: 'user' | 'environment' = 'environment';
    icons = {
        camera: faCamera,
        switch: faCameraRotate,
        images: faImages,
        submit: faCheck,
        delete: faTrash
    }
    loading: boolean = false;

    tempImages: Array<{ blob: Blob, base64: string, selected: boolean }> = [];
    cameraStream!: MediaStream;
    modalInstance!: NgbModalRef;
    files: Array<string> = [];
    @Output() filesChange = new EventEmitter<Array<string>>();

    constructor(private ngbModal: NgbModal, private fileService: FileService) { }

    ngOnDestroy(): void {
        this.stopCamera(this.cameraStream);
    }

    ngAfterViewInit() {
        this.modalInstance = this.ngbModal.open(this.cameraModal,
            {
                fullscreen: true,
                backdrop: 'static'
            });
        this.modalInstance.shown.subscribe(
            (_result: any) => {
                this.setupCamera();
            }
        );
        this.modalInstance.hidden.subscribe(
            (result: any) => {
                this.stopCamera(this.cameraStream);
                this.dissmiss.emit();
            }
        )
    }

    async setupCamera() {
        try {
            const cameraFeedRef: any = document.getElementById('cameraFeed');
            if (!cameraFeedRef) {
                return;
            }
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentCamera
                }
            });
            cameraFeedRef.srcObject = this.cameraStream;
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
        }
    }

    async switchCamera() {
        this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';
        this.stopCamera(this.cameraStream);
        this.setupCamera();
    }

    async takePhoto() {
        if (this.tempImages.length >= 10) {
            return;
        }
        const cameraFeedRef: any = document.getElementById('cameraFeed');
        if (!cameraFeedRef) {
            return;
        }
        const photoCanvas = document.createElement('canvas');
        photoCanvas.style.display = 'none';
        photoCanvas.width = cameraFeedRef.videoWidth;
        photoCanvas.height = cameraFeedRef.videoHeight;
        const context = photoCanvas.getContext('2d');
        context?.drawImage(cameraFeedRef, 0, 0, photoCanvas.width, photoCanvas.height);

        photoCanvas.toBlob(async (blob) => {
            if (blob) {
                this.tempImages.push({
                    blob: blob,
                    base64: await this.arrayBufferToBase64(blob),
                    selected: false
                });
            }
        }, 'image/jpeg', 1);
    }

    async arrayBufferToBase64(imageBlob: Blob): Promise<string> {
        const arrayBuffer = await imageBlob.arrayBuffer(); // Convertir el Blob a ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        uint8Array.forEach(byte => binary += String.fromCharCode(byte));
        return 'data:image/jpeg;base64,' + btoa(binary);
    }

    areSelected() {
        return this.tempImages.some(im => im.selected);
    }

    async stopCamera(cameraStream: MediaStream) {
        if (cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        return true;
    }

    deleteSelected() {
        this.tempImages = this.tempImages.filter(ti => !ti.selected);
    }

    async addFiles(fileList: FileList) {
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const reader = new FileReader();

            reader.onload = async (event: any) => {
                const blob = new Blob([event.target.result], { type: file.type });
                this.tempImages.push({
                    blob: blob,
                    base64: await this.arrayBufferToBase64(blob),
                    selected: false
                })
            };

            reader.readAsArrayBuffer(file);
        }
    }

    submitFiles() {
        this.loading = true;
        const filesData = this.blobsToFileList();
        const formData = new FormData();
        let filesLength = Array.from(filesData).length;
        filesLength = filesLength < 10 ? filesLength : 9;
        for (let i = 0; i < filesLength; i++) {
            formData.append('files', filesData[i]);
        }
        this.fileService.uploadFile(formData)
            .subscribe({
                next: (data: any) => {
                    if (!Array.isArray(this.files)) {
                        this.files = [];
                    }
                    this.files.push(...data.urls);
                    this.filesChange.emit(this.files);
                    this.loading = false;
                    this.modalInstance.close();
                },
                error: (error) => {
                    console.log(error);
                    this.loading = false;
                    this.modalInstance.close();
                }
            })
    }

    blobsToFileList() {
        const fileList = new DataTransfer();

        this.tempImages.forEach((ti) => {
            const filename = this.generateRandomName(5)
            const file = new File([ti.blob], filename, { type: ti.blob.type });
            fileList.items.add(file);
        });

        return fileList.files;
    }

    generateRandomName(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomName = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomName += characters.charAt(randomIndex);
        }

        const timestamp = Date.now();
        return `${randomName}_${timestamp}`;
    }

    async getImageBlob(imageUrl: string) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return blob;
    }

    async pickFiles() {
        const files = await Camera.pickImages({ presentationStyle: 'fullscreen' });

        files.photos.forEach(async (image) => {
            if (image.webPath) {
                const blob = await this.getImageBlob(image.webPath);
                this.tempImages.push({
                    base64: await this.arrayBufferToBase64(blob),
                    blob: blob,
                    selected: false
                });
            }

        });
    }

}
