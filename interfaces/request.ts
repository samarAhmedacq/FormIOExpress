interface request {
  formID: string;
  RequestorId: string;
  name: string;
  email: string;
  status: string;
  Type: string;
  id?: string;
  _rid?: string;
  _self?: string;
  _etag?: string;
  _attachments?: string;
  _ts?: number;
}

export default request;
