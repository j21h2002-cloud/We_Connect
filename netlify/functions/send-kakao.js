/**
 * 카카오 알림톡 발송 - Netlify Function
 * POST /.netlify/functions/send-kakao
 * Body: { app_key, sender_key, template_code, receivers: [{name, phone}], template_vars: {} }
 *
 * 환경변수 (Netlify 대시보드 > Site settings > Environment variables):
 *   KAKAO_APP_KEY    - 알리고 API Key
 *   KAKAO_SENDER_KEY - 카카오 발신 프로필 키
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

  // 환경변수 우선, 없으면 요청 본문에서 가져옴 (테스트용)
  const appKey    = process.env.KAKAO_APP_KEY    || body.app_key
  const senderKey = process.env.KAKAO_SENDER_KEY || body.sender_key

  if (!appKey || !senderKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'API Key가 설정되지 않았습니다.' })
    }
  }

  const { template_code, receivers = [], template_vars = {} } = body

  if (!template_code || receivers.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '템플릿 코드 또는 수신자가 없습니다.' })
    }
  }

  let successCount = 0
  const results = []

  for (const recv of receivers) {
    const phone = (recv.phone || recv.kakao_receiver || '').replace(/[-\s]/g, '')
    if (!phone) {
      results.push({ name: recv.name, status: 'fail', reason: '번호 없음' })
      continue
    }

    try {
      const params = new URLSearchParams({
        apikey:     appKey,
        userid:     process.env.KAKAO_USER_ID || 'apitest',
        senderkey:  senderKey,
        tpl_code:   template_code,
        sender:     process.env.KAKAO_SENDER_NUM || '',
        receiver_1: phone,
        recvname_1: recv.name || '',
      })

      // 템플릿 변수 추가
      if (Object.keys(template_vars).length > 0) {
        let msg = ''
        Object.entries(template_vars).forEach(([k, v]) => {
          msg += `#\{${k}\}# `
        })
        params.set('message_1', msg.trim())
      }

      const res = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      const json = await res.json()

      if (json.code === '0' || json.code === 0) {
        successCount++
        results.push({ name: recv.name, status: 'success' })
      } else {
        results.push({ name: recv.name, status: 'fail', reason: json.message || '발송 실패' })
      }
    } catch (err) {
      results.push({ name: recv.name, status: 'fail', reason: err.message })
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: successCount > 0,
      message: `${receivers.length}건 중 ${successCount}건 성공`,
      successCount,
      failCount: receivers.length - successCount,
      results
    })
  }
}
