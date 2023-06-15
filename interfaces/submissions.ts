export interface submission {
  id?: string;
  formId?:string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  jsonSchema: any;
  submitData:any;
}
export default submission;
