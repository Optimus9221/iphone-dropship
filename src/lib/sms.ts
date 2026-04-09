import twilio from "twilio";
import { toE164 } from "./phone";

const SITE = process.env.NEXT_PUBLIC_SITE_NAME ?? "iPhree";

function smsBody(code: string, locale?: string): string {
  if (locale === "ru") return `Код подтверждения ${SITE}: ${code}`;
  if (locale === "uk") return `Код підтвердження ${SITE}: ${code}`;
  return `Your ${SITE} verification code: ${code}`;
}

/**
 * @returns true if SMS was sent (or dev fallback succeeded)
 */
export async function sendRegistrationSms(
  phoneDigits: string,
  code: string,
  locale?: string
): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || (!messagingServiceSid && !fromNumber)) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[dev] SMS to ${toE164(phoneDigits)}: ${smsBody(code, locale)}`);
      return true;
    }
    return false;
  }

  try {
    const client = twilio(sid, token);
    const to = toE164(phoneDigits);
    if (messagingServiceSid) {
      await client.messages.create({
        body: smsBody(code, locale),
        to,
        messagingServiceSid,
      });
    } else if (fromNumber) {
      await client.messages.create({
        body: smsBody(code, locale),
        to,
        from: fromNumber,
      });
    }
    return true;
  } catch (e) {
    console.error("Twilio SMS error:", e);
    return false;
  }
}
