import { getDatabase } from "@/configs/connection.config";

interface BaseProps {
  verificationCode: string;
  userName: string;
}

// Helper function to replace placeholders in template
const replacePlaceholders = (
  template: string,
  placeholders: Record<string, string>
): string => {
  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
};

// Fetch template from database or use fallback
const getTemplate = async (
  templateName: string,
  fallbackTemplate: string
): Promise<string> => {
  try {
    const db = await getDatabase();
    const template = await db.query.emailTemplates.findFirst({
      where: (t, { eq }) => eq(t.name, templateName),
    });

    if (template && template.htmlContent) {
      return template.htmlContent;
    }
  } catch (error) {
    console.error(`Error fetching template ${templateName}:`, error);
  }
  return fallbackTemplate;
};

// Default templates (used as fallback)
const defaultSignupTemplate = ({ userName, verificationCode }: BaseProps) => {
  return `<div>
          <img style="width:120px;" src="${process.env
            .CLIENT_DOMAIN!}/logo/logo.png" />       
          <p style="font-size:20px">Hi ${userName},</p>
          <p>We're happy you signed up for Beat Feedback. To start exploring our app and neighborhood, please use the following verification code to proceed:</p>
          <p>Verification Code</p>
          <p style="background: #FD9ED7; width: fit-content; padding: 7px 10px; border-radius: 10px; font-size:20px; margin-top: -10px">${verificationCode}</p>
          <p>Welcome to Beat Feedback!</p>
          <p><span style="font-size:14px;">The verification code will expire in 5 minutes.&nbsp;</span></p>
          </div>`;
};

const defaultGeneralVerificationTemplate = ({
  purpose,
  userName,
  verificationCode,
}: BaseProps & { purpose: string }) => {
  return `<div>
  
  <img style="width:120px;" src="https://beatfeedback-fe.vercel.app/logo/logo.png" />
            <p style="font-size:20px">Hi ${userName},</p>
            <p>You're receiving this email because you requested to ${purpose} on Beat Feedback. Please use the following verification code to proceed:</p>
            <p>Verification Code</p>
            <p style="background: #FD9ED7; width: fit-content; padding: 7px 10px; border-radius: 10px; font-size:20px; margin-top: -10px">${verificationCode}</p>
            <p>If you did not make this request, please disregard this email.</p>
            <p style="margin-top: -13px">Best regards,</p>
            <p><span style="font-size:14px;">The verification code will expire in 5 minutes.&nbsp;</span></p>
  
            </div>`;
};

const defaultNewsletterTemplate = ({
  email,
  userName,
}: {
  email: string;
  userName: string;
}) => {
  return `<div>
          <img style="width:120px; margin: auto" src="https://beatfeedback-fe.vercel.app/logo/logo.png" />       
          
          <p style="font-size:20px">Hi ${userName},</p>
          <p>Thank you for subscribing to Beat Feedback updates! You'll now receive all the latest news, upcoming features, and exclusive offers directly in your inbox.</p>
          
          <p>We're excited to have you on board and look forward to keeping you in the loop!</p>

          <p>If you wish to unsubscribe from these updates at any time, just click the link below:</p>

          <a href="${process.env.BACKEND_DOMAIN}/api/removecontact/${encodeURI(
    email
  )}" style="color: #FD9ED7; font-size:18px;">Unsubscribe</a>
          <p>Best regards,<br>Beat Feedback Team</p>
          </div>`;
};

const defaultDjRatingNotificationTemplate = ({
  djName,
  eventName,
  eventDate,
  clientName,
  eventResultsUrl,
}: {
  djName: string;
  eventName: string;
  eventDate: string;
  clientName: string;
  eventResultsUrl: string;
}) => {
  return `<div>
    <p><strong>${djName},</strong></p>
    <p>You've just received ratings for the following</p>
    <p>&nbsp;</p>
    <p style="line-height:20px;">Event Name: <strong>${eventName}</strong></p>
    <p style="line-height:20px;">User: <strong>${clientName}</strong></p>
    <p style="line-height:20px;">Event Date: <strong>${eventDate}</strong></p>
    <p>&nbsp;</p>
    <p><a target="_blank" rel="noopener noreferrer" href=${eventResultsUrl}><strong>View the Results Here</strong></a></p>
    <p>Keep up the great work!</p>
</div>`;
};

// Exported functions that use database templates with fallback
export const signupTemplate = async ({
  userName,
  verificationCode,
}: BaseProps) => {
  const fallback = defaultSignupTemplate({ userName, verificationCode });
  const template = await getTemplate("signup", fallback);
  return replacePlaceholders(template, {
    userName,
    verificationCode,
    clientDomain:
      process.env.CLIENT_DOMAIN || "https://beatfeedback-fe.vercel.app",
  });
};

export const generalVerificationTemplate = async ({
  purpose,
  userName,
  verificationCode,
}: BaseProps & { purpose: string }) => {
  const fallback = defaultGeneralVerificationTemplate({
    purpose,
    userName,
    verificationCode,
  });
  // Determine template name based on purpose
  const templateName =
    purpose.toLowerCase().includes("email") ||
    purpose.toLowerCase().includes("verify")
      ? "email_verification"
      : "password_reset";
  const template = await getTemplate(templateName, fallback);
  return replacePlaceholders(template, {
    userName,
    verificationCode,
    purpose,
    clientDomain:
      process.env.CLIENT_DOMAIN || "https://beatfeedback-fe.vercel.app",
  });
};

export const newsletterTemplate = async ({
  email,
  userName,
}: {
  email: string;
  userName: string;
}) => {
  const fallback = defaultNewsletterTemplate({ email, userName });
  const template = await getTemplate("newsletter", fallback);
  return replacePlaceholders(template, {
    userName,
    email,
    unsubscribeUrl: `${
      process.env.BACKEND_DOMAIN
    }/api/removecontact/${encodeURI(email)}`,
    clientDomain:
      process.env.CLIENT_DOMAIN || "https://beatfeedback-fe.vercel.app",
  });
};

export const djRatingNotificationTemplate = async ({
  djName,
  eventName,
  eventDate,
  clientName,
  eventResultsUrl,
}: {
  djName: string;
  eventName: string;
  eventDate: string;
  clientName: string;
  eventResultsUrl: string;
}) => {
  const fallback = defaultDjRatingNotificationTemplate({
    djName,
    eventName,
    eventDate,
    clientName,
    eventResultsUrl,
  });
  const template = await getTemplate("rating_notification", fallback);
  return replacePlaceholders(template, {
    djName,
    eventName,
    eventDate,
    clientName,
    eventResultsUrl,
  });
};
