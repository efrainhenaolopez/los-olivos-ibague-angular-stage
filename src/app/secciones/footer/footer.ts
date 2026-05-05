import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MobileService } from '../../servicios/mobile';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive, /*PopUpEthicalLineComponentComponent, PopUpContactPhonesComponentComponent, PopUpOptionsRelievesComponentComponent*/],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterSection {public isMobile: boolean = false;
  public modal:boolean = false;
  public modalPhones: boolean = false;

  public modalRelieves = false;
  public optionRelieves = {};


  constructor(private MobileService: MobileService) {
    this.isMobile = this.MobileService.isMobile();
  }

  openModal(){
    this.modal = true;
  }

  closeModal(){
    this.modal = false;
  }

  openModalPhones(){
    this.modalPhones = true;
  }

  closeModalPhones(){
    this.modalPhones = false;
  }

  openModalRelieves(title: string, option: string){
    this.modalRelieves = true;

    this.optionRelieves = {
      title,
      option
    }
  }

  closeModalRelieves() {
    this.modalRelieves = false;
  }

}
