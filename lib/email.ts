import nodemailer from 'nodemailer';

// 邮件配置
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// 创建邮件传输器
const transporter = nodemailer.createTransport(emailConfig);

// 邮件发送接口
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 发送邮件
export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: `"ACGN导航" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('邮件发送失败:', error);
    return { success: false, error };
  }
}

// 审核通过邮件模板
export function getApprovalEmailTemplate(submission: any) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🎉 恭喜！您的网站申请已通过审核</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          您好！我们很高兴地通知您，您提交的网站申请已经通过审核，现已成功收录到ACGN导航平台。
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">📋 申请详情</h3>
          <p><strong>网站名称：</strong>${submission.name}</p>
          <p><strong>网站地址：</strong><a href="${submission.url}" style="color: #007bff;">${submission.url}</a></p>
          <p><strong>所属分类：</strong>${submission.category?.name || '未知分类'}</p>
          <p><strong>提交时间：</strong>${new Date(submission.createdAt).toLocaleString('zh-CN')}</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          您的网站现在可以在ACGN导航平台的相关分类中找到。感谢您对ACGN导航的支持！
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://acgn.org'}" 
             style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            访问ACGN导航
          </a>
        </div>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            此邮件由系统自动发送，请勿回复。<br>
            如有疑问，请联系我们的客服团队。
          </p>
        </div>
      </div>
    </div>
  `;
}

// 审核拒绝邮件模板
export function getRejectionEmailTemplate(submission: any, adminNote?: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">📝 网站申请审核结果通知</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          您好！很遗憾地通知您，您提交的网站申请未能通过我们的审核。
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #dc3545; margin-top: 0;">📋 申请详情</h3>
          <p><strong>网站名称：</strong>${submission.name}</p>
          <p><strong>网站地址：</strong><a href="${submission.url}" style="color: #007bff;">${submission.url}</a></p>
          <p><strong>所属分类：</strong>${submission.category?.name || '未知分类'}</p>
          <p><strong>提交时间：</strong>${new Date(submission.createdAt).toLocaleString('zh-CN')}</p>
          ${adminNote ? `<p><strong>审核备注：</strong>${adminNote}</p>` : ''}
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">💡 建议</h4>
          <p style="color: #856404; margin: 0; font-size: 14px;">
            您可以根据审核反馈修改网站内容后重新提交申请。我们期待您的再次申请！
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://acgn.org'}/submit" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            重新提交申请
          </a>
        </div>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6c757d; font-size: 14px; margin: 0;">
            此邮件由系统自动发送，请勿回复。<br>
            如有疑问，请联系我们的客服团队。
          </p>
        </div>
      </div>
    </div>
  `;
}

// 发送审核通过邮件
export async function sendApprovalEmail(submission: any) {
  const subject = `🎉 恭喜！您的网站"${submission.name}"已通过审核`;
  const html = getApprovalEmailTemplate(submission);
  
  return await sendEmail({
    to: submission.contactEmail,
    subject,
    html
  });
}

// 发送审核拒绝邮件
export async function sendRejectionEmail(submission: any, adminNote?: string) {
  const subject = `📝 网站"${submission.name}"审核结果通知`;
  const html = getRejectionEmailTemplate(submission, adminNote);
  
  return await sendEmail({
    to: submission.contactEmail,
    subject,
    html
  });
}
