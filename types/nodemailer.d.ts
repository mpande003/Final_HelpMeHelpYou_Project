declare module "nodemailer" {
  type TransportOptions = {
    service: string;
    auth: {
      user: string;
      pass: string;
    };
  };

  type SendMailOptions = {
    from: string;
    replyTo?: string;
    to: string;
    subject: string;
    text: string;
  };

  type Transporter = {
    sendMail(options: SendMailOptions): Promise<void>;
  };

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}
