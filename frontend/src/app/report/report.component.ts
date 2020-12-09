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
  pluralDays: string;
  orgId: number;
  assetId: number;
  assessmentId: number;
  isLoading = true;
  urls = [];
  showButtons = true;
  pieData: any;
  radarData: any;
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
      this.pluralDays = (this.numOfDays > 1 || this.numOfDays === 0) ? 'days' : 'day';
      this.buildPieChart(report.vulns);
      this.buildRadarChart(report.vulns);
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
    const infoVulns = vulns.filter((x) => x.risk === 'Informational').length;
    const lowVulns = vulns.filter((x) => x.risk === 'Low').length;
    const mediumVulns = vulns.filter((x) => x.risk === 'Medium').length;
    const highVulns = vulns.filter((x) => x.risk === 'High').length;
    const criticalVulns = vulns.filter((x) => x.risk === 'Critical').length;
    this.pieData = {
      labels: [`Informational (${infoVulns})`, `Low (${lowVulns})`, `Medium (${mediumVulns})`, `High (${highVulns})`, `Critical (${criticalVulns})`],
      datasets: [
        {
          data: [infoVulns, lowVulns, mediumVulns, highVulns, criticalVulns],
          backgroundColor: [
            '#157a6e',
            '#499f68',
            '#77B28C',
            '#fec601',
            '#ae0a0a',
          ],
          hoverBackgroundColor: [
            '#157a6e',
            '#499f68',
            '#77B28C',
            '#fec601',
            '#ae0a0a',
          ],
        },
      ],
    };
  }
  buildRadarChart(vulns: Vulnerability[]) {
    const open = vulns.filter((x) => x.status === 'Open').length;
    const resolved = vulns.filter((x) => x.status === 'Resolved').length;
    const onHold = vulns.filter((x) => x.status === 'On Hold').length;
    this.radarData = {
      labels: ['Open', 'Resolved', 'On Hold'],
      datasets: [
        {
          label: 'Finding Status',
          backgroundColor: 'rgba(179,181,198,0.2)',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          data: [open, resolved, onHold],
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
