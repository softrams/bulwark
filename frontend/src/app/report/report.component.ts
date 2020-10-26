import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { Vulnerability } from '../vuln-form/Vulnerability';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.sass'],
})
export class ReportComponent implements OnInit {
  report: any;
  numOfDays: number;
  orgId: number;
  assetId: number;
  assessmentId: number;
  isLoading = true;
  urls = [];
  showButtons = true;
  pieData: any;
  constructor(
    public activatedRoute: ActivatedRoute,
    public appService: AppService,
    public router: Router
  ) {}

  ngOnInit() {
    const pathAry = this.activatedRoute.snapshot.url.map((obj) => obj.path);
    if (pathAry.includes('puppeteer')) {
      this.showButtons = false;
    }
    this.activatedRoute.data.subscribe(({ report }) => {
      this.report = report;
      this.numOfDays = Math.floor(
        (Date.parse(this.report.assessment.endDate) -
          Date.parse(this.report.assessment.startDate)) /
          86400000
      );
      this.buildPieChart(report.vulns);
      for (const vuln of report.vulns) {
        vuln.screenshotObjs = [];
        for (const screenshot of vuln.screenshots) {
          this.appService.getImageById(screenshot).then((url) => {
            const screenshotObj = {
              url,
              name: screenshot.originalname,
            };
            this.urls.push(url);
            vuln.screenshotObjs.push(screenshotObj);
          });
        }
      }
    });
    this.activatedRoute.params.subscribe((params) => {
      this.orgId = params.orgId;
      this.assetId = params.assetId;
      this.assessmentId = params.assessmentId;
    });
  }

  buildPieChart(vulns: Vulnerability[]) {
    for (let vuln of vulns) {
      console.log(vuln.risk);
    }
    const infoVulns = vulns.filter((x) => x.risk === 'Informational').length;
    const lowVulns = vulns.filter((x) => x.risk === 'Low').length;
    const mediumVulns = vulns.filter((x) => x.risk === 'Medium').length;
    const highVulns = vulns.filter((x) => x.risk === 'High').length;
    const criticalVulns = vulns.filter((x) => x.risk === 'Critical').length;
    this.pieData = {
      labels: ['Informational', 'Low', 'Medium', 'High', 'Critical'],
      datasets: [
        {
          data: [infoVulns, lowVulns, mediumVulns],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    };
  }
  /**
   * Function responsible for navigating the user to the Vulnerability Listing
   */
  navigateToVulns() {
    this.router.navigate([
      `organization/${this.orgId}/asset/${this.assetId}/assessment/${this.assessmentId}/vulnerability`,
    ]);
  }

  /**
   * Function that triggers when viewing vulnerabilities listing for an assessment
   * Data is passed from the report component object and handled within the function
   */
  generateReport() {
    this.appService
      .generateReport(this.orgId, this.assetId, this.assessmentId)
      .subscribe((res: Blob) => {
        const blob = new Blob([res], {
          type: res.type,
        });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  }
}
