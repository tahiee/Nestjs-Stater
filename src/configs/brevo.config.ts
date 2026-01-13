import * as Brevo from "@sendinblue/client";
import { config } from "dotenv";
config();

export const brevoTransactionApi = new Brevo.TransactionalEmailsApi();
export const brevoContactsApi = new Brevo.ContactsApi();

brevoTransactionApi.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

brevoContactsApi.setApiKey(
  Brevo.ContactsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);
