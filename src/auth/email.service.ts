import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOtpEmail(email: string, code: string): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get('SMTP_PORT', 465));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('MAIL_FROM') || user;

    if (!host || !user || !pass || !from || !Number.isInteger(port)) {
      throw new InternalServerErrorException(
        'إعدادات إرسال البريد الإلكتروني غير مكتملة',
      );
    }

    const ttlMinutes = Number(this.config.get('OTP_TTL_MINUTES', 10));

    const heading = 'استعادة كلمة المرور';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const text = [
      `مرحبًا،`,
      ``,
      `كود ${heading} هو: ${code}`,
      `صلاحية الكود ${ttlMinutes} دقائق.`,
      `إذا لم تطلب هذه العملية، يمكنك تجاهل الرسالة.`,
    ].join('\n');

    const html = `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto;line-height:1.8">
        <h2>${heading}</h2>
        <p>استخدم الكود التالي لإكمال العملية:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f3f4f6;text-align:center">
          ${code}
        </div>
        <p>صلاحية الكود ${ttlMinutes} دقائق، ويمكن استخدامه مرة واحدة فقط.</p>
        <p>إذا لم تطلب هذه العملية، فتجاهل الرسالة.</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: `${heading} - Sunday School`,
        text,
        html,
      });
    } catch {
      this.logger.error('Failed to send OTP email');
      throw new InternalServerErrorException(
        'تعذر إرسال البريد الإلكتروني، حاول مرة أخرى لاحقًا',
      );
    }
  }
}
