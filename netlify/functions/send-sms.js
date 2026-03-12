/**
 * 문자(SMS/LMS) 발송 - Netlify Function
 * POST /.netlify/functions/send-sms
 * Body: { api_key, user_id, sender_num, content, receivers: [{company_name, contact_name, phone}] }
 *
 * 환경변수 (Netlify 대시보드 > Site settings > Environment variables):
 *   ALIGO_API_KEY   - 알리고 API Key
 *   ALIGO_USER_ID   - 알리고 아이디
 *   ALIGO_SENDER    - 발신 번호
 */
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

  const apiKey    = process.env.ALIGO_API_KEY  || body.api_key
  const userId    = process.env.ALIGO_USER_ID  || body.user_id
  const senderNum = process.env.ALIGO_SENDER   || body.sender_num

  if (!apiKey || !userId || !senderNum) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '알리고 API 설정이 누락되었습니다. ⚙️ 설정 메뉴를 확인하세요.' })
    }
  }

  const { content, receivers = [] } = body
  if (!content || receivers.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '문자 내용 또는 수신자가 없습니다.' })
    }
  }

  // 연락처 있는 수신자만 필터
  const validReceivers = receivers.filter(r => r.phone)
  const noPhoneCount   = receivers.length - validReceivers.length

  let successCount = 0
  const results = []

  // 알리고 SMS API 호출 (최대 500건씩 배치 처리)
  const BATCH = 100
  for (let i = 0; i < validReceivers.length; i += BATCH) {
    const batch = validReceivers.slice(i, i + BATCH)

    const params = new URLSearchParams({
      key:     apiKey,
      user_id: userId,
      sender:  senderNum,
      msg:     content,
      // 장문 여부 자동 감지
      msg_type: content.length > 90 ? 'LMS' : 'SMS',
    })

    // 수신자 번호 (알리고는 쉼표 구분)
    params.set('receiver', batch.map(r => r.phone.replace(/[-\s]/g, '')).join(','))

    // 수신자명 (이름 구분)
    params.set('destination', batch.map(r =>
      (r.phone.replace(/[-\s]/g, '')) + '|' + (r.contact_name || r.company_name || '')
    ).join(','))

    try {
      const res  = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const json = await res.json()

      if (json.result_code === '1' || json.result_code === 1) {
        batch.forEach(r => {
          successCount++
          results.push({ name: r.company_name || r.contact_name, status: 'success' })
        })
      } else {
        batch.forEach(r =>
          results.push({ name: r.company_name || r.contact_name, status: 'fail', reason: json.message || '발송 실패' })
        )
      }
    } catch (err) {
      batch.forEach(r =>
        results.push({ name: r.company_name || r.contact_name, status: 'fail', reason: err.message })
      )
    }
  }

  // 연락처 없는 수신자 실패 처리
  receivers.filter(r => !r.phone).forEach(r =>
    results.push({ name: r.company_name || r.contact_name, status: 'fail', reason: '연락처 미등록' })
  )

  const total = receivers.length
  const failCount = total - successCount

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: successCount > 0,
      message: `${total}건 중 ${successCount}건 성공${noPhoneCount ? ` (연락처 미등록 ${noPhoneCount}건 제외)` : ''}`,
      successCount,
      failCount,
      results
    })
  }
}
