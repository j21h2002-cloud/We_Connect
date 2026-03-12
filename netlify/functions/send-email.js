/**
 * 이메일 발송 - Netlify Function (nodemailer SMTP)
 * POST /.netlify/functions/send-email
 * Body: { subject, body, receivers: [{company_name, contact_name, email}] }
 *
 * 환경변수 (Netlify 대시보드 > Site settings > Environment variables):
 *   SMTP_HOST   - SMTP 서버 주소 (예: smtp.gmail.com)
 *   SMTP_PORT   - SMTP 포트 (예: 587)
 *   SMTP_USER   - 발신 이메일 주소
 *   SMTP_PASS   - 앱 비밀번호 (Gmail: 구글 앱 비밀번호 16자리)
 *   SMTP_FROM   - 발신자 이름 (예: 웹케시)
 *
 * Gmail 앱 비밀번호 발급: Google 계정 > 보안 > 앱 비밀번호
 */
const nodemailer = require('nodemailer')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: '잘못된 요청입니다.' }) }
  }

  // 요청 본문의 smtp 설정 우선, 없으면 환경변수 폴백
  const bodySmtp = body.smtp || {}
  const smtpHost  = bodySmtp.host       || process.env.SMTP_HOST
  const smtpPort  = parseInt(bodySmtp.port || process.env.SMTP_PORT || '587')
  const smtpUser  = bodySmtp.user       || process.env.SMTP_USER
  const smtpPass  = bodySmtp.pass       || process.env.SMTP_PASS
  const fromName  = bodySmtp.from_name  || process.env.SMTP_FROM  || smtpUser
  // 수신자에게 보이는 발신 주소 — 설정 없으면 SMTP 계정 주소 그대로 사용
  const fromEmail = bodySmtp.from_email || smtpUser

  if (!smtpHost || !smtpUser || !smtpPass) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '이메일 SMTP 설정이 누락되었습니다. 개인 이메일 설정 또는 ⚙️ 설정 메뉴를 확인하세요.' })
    }
  }

  const { subject, body: content, receivers = [] } = body
  if (!subject || !content || receivers.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '제목, 내용 또는 수신자가 없습니다.' })
    }
  }

  // 포트별 연결 방식:
  //   465 → SSL (secure: true)
  //   587 → STARTTLS (secure: false, requireTLS: true)
  //   25  → SMTP Relay (인증 없는 내부 서버)
  const transportOpts = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,          // 465만 SSL
    requireTLS: smtpPort === 587,      // 587은 STARTTLS 강제
    tls: { rejectUnauthorized: false }, // 자체 서명 인증서 허용 (회사 내부 서버 대응)
  }
  // 비밀번호가 있을 때만 인증 추가 (포트 25 SMTP Relay는 인증 생략 가능)
  if (smtpUser && smtpPass) {
    transportOpts.auth = { user: smtpUser, pass: smtpPass }
  }

  const transporter = nodemailer.createTransport(transportOpts)

  let successCount = 0
  const results = []

  for (const recv of receivers) {
    if (!recv.email) {
      results.push({ name: recv.company_name || recv.contact_name, status: 'fail', reason: '이메일 미등록' })
      continue
    }

    try {
      await transporter.sendMail({
        from:    `"${fromName}" <${fromEmail}>`,
        // 표시 주소와 SMTP 계정이 다를 때 Reply-To 설정 (답장이 회사 메일로)
        ...(fromEmail !== smtpUser ? { replyTo: fromEmail } : {}),
        to:      `"${recv.contact_name || recv.company_name}" <${recv.email}>`,
        subject,
        // 줄바꿈을 <br>로 변환하여 HTML 발송
        html: `<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#222">
          ${content.replace(/\n/g, '<br>')}
        </div>`,
        text: content,
      })
      successCount++
      results.push({ name: recv.company_name || recv.contact_name, status: 'success' })
    } catch (err) {
      results.push({ name: recv.company_name || recv.contact_name, status: 'fail', reason: err.message })
    }
  }

  const total     = receivers.length
  const failCount = total - successCount

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: successCount > 0,
      message: `${total}건 중 ${successCount}건 발송 완료`,
      successCount,
      failCount,
      results
    })
  }
}
