import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.sass']
})
export class AssessmentsComponent implements OnInit {
  assessmentAry: any = [];
  assetId: number;
  
  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit() {
      this.assetId = +this.activatedRoute.snapshot.params.id;
      this.appService.getAssessments(this.assetId).then(res => {
        this.assessmentAry = res;
      });
  }

}
