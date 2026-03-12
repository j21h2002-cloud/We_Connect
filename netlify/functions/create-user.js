/**
 * 사용자 계정 생성 - Netlify Function
 * POST /.netlify/functions/create-user
 * Body: { username, password, name, role }
 *
 * 환경변수 (Netlify > Site settings > Environment variables):
 *   SUPABASE_URL          - Supabase Project URL
 *   SUPABASE_SERVICE_KEY  - Supabase service_role 키 (Settings > API > service_role)
 */
const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const { username, password, name, role } = JSON.parse(event.body || '{}')

  if (!username || !password || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '아이디, 비밀번호, 성명은 필수입니다.' })
    }
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY  // service_role 키 사용 (이메일 인증 우회)
  )

  const email = username + '@weconnect.system'

  // Admin API: 이메일 발송 없이 계정 생성
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true  // 이메일 확인 건너뛰기
  })

  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: error.message })
    }
  }

  // user_profiles 테이블에 프로필 저장
  const { error: e2 } = await sb.from('user_profiles').insert({
    id: data.user.id,
    username,
    name,
    role: role || 'user',
    active: true
  })

  if (e2) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: '프로필 저장 실패: ' + e2.message })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: '계정이 생성되었습니다.' })
  }
}
