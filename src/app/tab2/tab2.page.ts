import { Component, OnInit } from '@angular/core';
import { IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonRow, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';
import { Foto } from '../services/foto';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonRow, IonTitle, IonToolbar]
})
export class Tab2Page implements OnInit {
  constructor(public fotoService: Foto) {
    addIcons({ camera });
  }

  public async ngOnInit() {
    await this.fotoService.loadSaved();
  }

  public async addPhotoToGallery() {
    await this.fotoService.addNewToGallery();
  }
}
