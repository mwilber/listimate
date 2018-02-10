import { Observable } from 'rxjs';
import { OnInit, Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ListService } from '../../services/list.service';
import { ListPage } from '../list/list';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  listPage = ListPage;
  addListForm: FormGroup;
  lists: Observable<any[]>;

  constructor(
    public navCtrl: NavController,
    private listSrv: ListService
  ) {}

  ngOnInit(){
    this.InitAddListForm();
  }

  ionViewDidEnter(){
    this.lists = this.listSrv.FirebaseConnect();

  }

  InitAddListForm(){
    this.addListForm = new FormGroup({
      'title': new FormControl(null, Validators.required)
    });
  }

  onAddList(){
    this.listSrv.AddList(this.addListForm.get('title').value);
    this.addListForm.reset();
  }

  onRemoveFromLists(list: any){
    this.listSrv.RemoveList(list);
  }


}
