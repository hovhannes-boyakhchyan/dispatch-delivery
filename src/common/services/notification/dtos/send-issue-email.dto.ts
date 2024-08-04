export class SendIssueEmailDto {
  type?: string;
  subject?: string;
  owner?: string;
  provider?: string;
  orderNumber?: string;
  resCode?: string;
  error: string;
  body?: string;
}
