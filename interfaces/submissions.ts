export interface submission {
  id?: string;
  formId?:string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail: string;
  jsonSchema: string;
  submitData: string;
}
export default submission;
