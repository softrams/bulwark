import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.sass']
})
export class ReportComponent implements OnInit, AfterViewInit {
  report: any;
  numOfDays: number;
  orgId: number;
  assetId: number;
  assessmentId: number;
  isLoading = true;
  urls = [];
  constructor(
    public activatedRoute: ActivatedRoute,
    public appService: AppService,
    private sanitizer: DomSanitizer,
    public router: Router
  ) {}
  ngAfterViewInit() {
    for (let url of this.urls) {
      console.log(url);
      window.URL.revokeObjectURL(url);
    }
  }
  ngOnInit() {
    this.activatedRoute.data.subscribe(({ report }) => {
      this.report = report;
      this.numOfDays = Math.floor(
        (Date.parse(this.report.assessment.endDate) - Date.parse(this.report.assessment.startDate)) / 86400000
      );
      for (const vuln of report.vulns) {
        vuln.screenshotObjs = [];
        for (const screenshot of vuln.screenshots) {
          this.appService.getScreenshotById(screenshot).then((url) => {
            const screenshotObj = {
              url: this.getSantizeUrl(url),
              name: screenshot.name
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

  public getSantizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
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
