import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.sass']
})
export class ReportComponent implements OnInit {
  report: any;
  numOfDays: number;
  orgId: number;
  assetId: number;
  assessmentId: number;
  isLoading = true;
  urls = [];
  constructor(public activatedRoute: ActivatedRoute, public appService: AppService, public router: Router) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ report }) => {
      this.report = report;
      this.numOfDays = Math.floor(
        (Date.parse(this.report.assessment.endDate) - Date.parse(this.report.assessment.startDate)) / 86400000
      );
      for (const vuln of report.vulns) {
        vuln.screenshotObjs = [];
        for (const screenshot of vuln.screenshots) {
          this.appService.getImageById(screenshot).then((url) => {
            const screenshotObj = {
              url,
              name: screenshot.originalname
            };
            this.urls.push(url);
            vuln.screenshotObjs.push(screenshotObj);
          });
        }
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params['orgId'];
      this.assetId = params['assetId'];
      this.assessmentId = params['assessmentId'];
    });
  }

  navigateToVulns() {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${this.assessmentId}/vulnerability`
    ]);
  }

  generateReport() {
    this.appService.generateReport(this.orgId, this.assetId, this.assessmentId).subscribe((res: Blob) => {
      const blob = new Blob([res], {
        type: res.type
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }
}
