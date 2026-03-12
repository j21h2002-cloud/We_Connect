/**
 * Supabase 설정
 * 실제 배포 시: Supabase > Project Settings > API 에서 복사해서 아래 값 변경
 */
const SUPABASE_URL  = 'https://dhjysormcgoydixgkzlq.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoanlzb3JtY2dveWRpeGdremxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzc4MTUsImV4cCI6MjA4ODg1MzgxNX0.18hFkxpO7_kQcx3qQ9Q36jTkYdihd5QJTxnx_LqEjOY'

// 내부 사용자 이메일 도메인 (Supabase Auth용)
const USER_DOMAIN = '@kakao.system'

// ─── 데모 모드 감지 ────────────────────────────────────
const IS_DEMO = SUPABASE_URL.includes('YOUR_PROJECT')

// ─── 산업군 목록 (공통 사용) ──────────────────────────
const INDUSTRIES = [
  'IT/플랫폼/게임','금융/보험','공공/행정','건설/부동산',
  '교육','미디어','서비스','식품','유통','유통/물류',
  '의료/바이오/헬스케어','제조/화학/에너지','기타'
]

// ─── 데모 로그인 자격증명 (username → password) ───────
const _DEMO_CREDS = {
  'admin': 'admin123',
  'user1': 'user123',
}

// ─── 데모 DB (인메모리, 새로고침 시 초기화) ───────────
const _DB = {
  customers: [
    { id:1,  company_name:'(주)삼성전자',    contact_name:'이영희', phone:'01012345678', email:'lee@samsung.com',    industry:'IT/플랫폼/게임',       memo:'VIP 고객사',      created_at:'2026-02-10T09:00:00' },
    { id:2,  company_name:'LG전자(주)',       contact_name:'박준혁', phone:'01023456789', email:'park@lg.com',         industry:'제조/화학/에너지',     memo:'',                created_at:'2026-02-11T10:00:00' },
    { id:3,  company_name:'현대자동차(주)',   contact_name:'최성민', phone:'01034567890', email:'choi@hyundai.com',    industry:'제조/화학/에너지',     memo:'계약 갱신 예정',  created_at:'2026-02-12T11:00:00' },
    { id:4,  company_name:'SK텔레콤(주)',     contact_name:'정수연', phone:'01045678901', email:'jung@skt.com',        industry:'IT/플랫폼/게임',       memo:'',                created_at:'2026-02-13T12:00:00' },
    { id:5,  company_name:'카카오(주)',       contact_name:'한지민', phone:'01056789012', email:'han@kakao.com',       industry:'IT/플랫폼/게임',       memo:'담당자 변경 예정', created_at:'2026-02-14T13:00:00' },
    { id:6,  company_name:'네이버(주)',       contact_name:'오승우', phone:'01067890123', email:'oh@naver.com',        industry:'IT/플랫폼/게임',       memo:'',                created_at:'2026-02-15T14:00:00' },
    { id:7,  company_name:'쿠팡(주)',         contact_name:'임채원', phone:'',            email:'',                   industry:'유통/물류',           memo:'연락처 미등록',   created_at:'2026-02-16T15:00:00' },
    { id:8,  company_name:'배달의민족(주)',   contact_name:'신예은', phone:'01089012345', email:'shin@baemin.com',     industry:'서비스',              memo:'',                created_at:'2026-02-17T16:00:00' },
    { id:9,  company_name:'GS리테일(주)',     contact_name:'강민준', phone:'01090123456', email:'kang@gsretail.com',   industry:'유통',               memo:'계절 프로모션',   created_at:'2026-02-18T09:00:00' },
    { id:10, company_name:'이마트(주)',       contact_name:'윤서연', phone:'01001234567', email:'yoon@emart.com',      industry:'유통',               memo:'',                created_at:'2026-02-19T10:00:00' },
    { id:11, company_name:'롯데마트(주)',     contact_name:'전지훈', phone:'01011112222', email:'jeon@lotte.com',      industry:'유통',               memo:'VIP',             created_at:'2026-02-20T11:00:00' },
    { id:12, company_name:'CJ대한통운(주)',   contact_name:'조미란', phone:'01022223333', email:'cho@cjlogistics.com', industry:'유통/물류',           memo:'물류 파트너',     created_at:'2026-02-21T12:00:00' },
  ],
  messages: [
    { id:1, channel:'kakao', title:'계약 갱신 안내',   template_code:'CONTRACT_RENEWAL', content:'안녕하세요. 귀사와의 계약 갱신 기간이 도래하였습니다. 확인 부탁드립니다.', image_url:'', created_at:'2026-02-01T09:00:00' },
    { id:2, channel:'kakao', title:'납부 안내',        template_code:'PAYMENT_NOTICE',   content:'이번 달 납부 기한이 다가왔습니다. 기한 내 납부 부탁드립니다.', image_url:'', created_at:'2026-02-02T09:00:00' },
    { id:3, channel:'kakao', title:'서비스 이용 안내', template_code:'SERVICE_NOTICE',   content:'서비스 이용 관련 안내드립니다. 자세한 내용은 첨부 이미지를 확인해 주세요.', image_url:'', created_at:'2026-02-03T09:00:00' },
    { id:4, channel:'sms',   title:'납부 기한 알림',   template_code:null, content:'[웹케시] 이번 달 납부 기한이 3일 남았습니다. 기한 내 납부 부탁드립니다.', image_url:'', created_at:'2026-02-04T09:00:00' },
    { id:5, channel:'sms',   title:'계약 만료 안내',   template_code:null, content:'[웹케시] 귀사 계약이 30일 후 만료됩니다. 갱신 의사를 알려주시면 안내드리겠습니다.', image_url:'', created_at:'2026-02-05T09:00:00' },
    { id:6, channel:'email', title:'월간 서비스 안내',  template_code:null, content:'안녕하세요.\n\n이번 달 서비스 이용 안내를 드립니다.\n\n자세한 내용은 담당자에게 문의해 주시기 바랍니다.\n\n감사합니다.\n웹케시 드림', image_url:'', created_at:'2026-02-06T09:00:00' },
    { id:7, channel:'email', title:'계약 갱신 요청',    template_code:null, content:'안녕하세요.\n\n귀사와의 계약 갱신 기간이 도래하였습니다.\n\n갱신 조건을 검토하신 후 회신 주시면 감사하겠습니다.\n\n담당자 연락처: 02-0000-0000\n\n감사합니다.\n웹케시 드림', image_url:'', created_at:'2026-02-07T09:00:00' },
  ],
  send_history: [
    {
      id:1, title:'계약 갱신 안내', template_code:'CONTRACT_RENEWAL',
      customer_count:6, success_count:5, fail_count:1, sent_by:'관리자', created_at:'2026-03-03T09:30:00',
      recipients:[
        { name:'(주)삼성전자',  status:'success' },
        { name:'LG전자(주)',    status:'success' },
        { name:'현대자동차(주)',status:'success' },
        { name:'SK텔레콤(주)', status:'success' },
        { name:'카카오(주)',    status:'success' },
        { name:'쿠팡(주)',     status:'fail', reason:'수신번호 미등록' },
      ]
    },
    {
      id:2, title:'서비스 이용 안내', template_code:'SERVICE_NOTICE',
      customer_count:4, success_count:4, fail_count:0, sent_by:'관리자', created_at:'2026-03-01T14:10:00',
      recipients:[
        { name:'네이버(주)',    status:'success' },
        { name:'배달의민족(주)',status:'success' },
        { name:'카카오(주)',    status:'success' },
        { name:'LG전자(주)',   status:'success' },
      ]
    },
    {
      id:3, title:'납부 안내', template_code:'PAYMENT_NOTICE',
      customer_count:3, success_count:2, fail_count:1, sent_by:'홍길동', created_at:'2026-02-25T10:00:00',
      recipients:[
        { name:'(주)삼성전자', status:'success' },
        { name:'SK텔레콤(주)',status:'success' },
        { name:'쿠팡(주)',    status:'fail', reason:'발송 오류' },
      ]
    },
  ],
  kakao_config: [
    { id:1, app_key:'', sender_key:'', user_id:'', sender_num:'' }
  ],
  email_config: [
    { id:1, smtp_host:'', smtp_port:587, smtp_user:'', smtp_pass:'', from_name:'' }
  ],
  user_profiles: [
    { id:'demo-admin', username:'admin', name:'관리자', role:'admin', email:'admin@company.com',  active:true, created_at:'2026-01-01T00:00:00' },
    { id:'demo-user1', username:'user1', name:'홍길동', role:'user',  email:'hong@company.com',  active:true, created_at:'2026-01-02T00:00:00' },
  ],
  company_emails: [
    { id:1, label:'대표 메일', email:'info@company.com',    created_at:'2026-01-01T00:00:00' },
    { id:2, label:'영업팀',   email:'sales@company.com',   created_at:'2026-01-01T00:00:00' },
    { id:3, label:'고객지원', email:'support@company.com', created_at:'2026-01-01T00:00:00' },
  ],
  user_email_config: [
    { id:'demo-admin', smtp_host:'smtp.gmail.com', smtp_port:587, smtp_user:'admin@gmail.com', smtp_pass:'', from_name:'관리자', from_email:'admin@company.com', updated_at:'2026-01-01T00:00:00' },
  ],
}

// ─── Mock Supabase Builder ────────────────────────────
function _mockBuilder(tableName) {
  let _rows = JSON.parse(JSON.stringify(_DB[tableName] || []))

  const self = {
    select: ()    => self,
    eq:     (col, val) => {
      _rows = _rows.filter(r => String(r[col]) === String(val))
      return self
    },
    order:  (col, opts) => {
      const asc = opts?.ascending !== false
      _rows = [..._rows].sort((a, b) => {
        const av = String(a[col] ?? ''), bv = String(b[col] ?? '')
        return asc ? av.localeCompare(bv, 'ko') : bv.localeCompare(av, 'ko')
      })
      return self
    },
    or: (q) => {
      const parts = q.split(',').map(p => {
        const m = p.match(/(\w+)\.ilike\.%(.*)%/)
        return m ? { col: m[1], val: m[2].toLowerCase() } : null
      }).filter(Boolean)
      if (parts.length) {
        _rows = _rows.filter(r => parts.some(p =>
          String(r[p.col] || '').toLowerCase().includes(p.val)
        ))
      }
      return self
    },
    ilike: (col, pat) => {
      const v = pat.replace(/%/g, '').toLowerCase()
      _rows = _rows.filter(r => String(r[col] || '').toLowerCase().includes(v))
      return self
    },
    limit: (n) => { _rows = _rows.slice(0, n); return self },
    single: () => {
      return Promise.resolve({ data: _rows[0] ?? null, error: null })
    },
    insert: (rows) => {
      const arr = Array.isArray(rows) ? rows : [rows]
      arr.forEach((r, i) => {
        const newRow = { id: Date.now() + i, created_at: new Date().toISOString(), ...r }
        _DB[tableName].push(newRow)
      })
      return Promise.resolve({ error: null })
    },
    update: (data) => ({
      eq: (col, val) => {
        _DB[tableName] = _DB[tableName].map(r =>
          String(r[col]) === String(val) ? { ...r, ...data } : r
        )
        return Promise.resolve({ error: null })
      }
    }),
    delete: () => ({
      eq: (col, val) => {
        _DB[tableName] = _DB[tableName].filter(r => String(r[col]) !== String(val))
        return Promise.resolve({ error: null })
      }
    }),
    upsert: (row) => {
      const arr = Array.isArray(row) ? row : [row]
      arr.forEach(r => {
        const idx = _DB[tableName].findIndex(x => x.id === r.id)
        if (idx >= 0) _DB[tableName][idx] = { ..._DB[tableName][idx], ...r }
        else _DB[tableName].push({ created_at: new Date().toISOString(), ...r })
      })
      return Promise.resolve({ error: null })
    },
    then: (fn) => Promise.resolve({ data: _rows, error: null }).then(fn),
  }
  return self
}

// ─── Mock Storage ─────────────────────────────────────
const _STORAGE = {}
function _mockStorage(bucket) {
  return {
    upload: (name, blob) => {
      _STORAGE[bucket] = _STORAGE[bucket] || []
      _STORAGE[bucket].push({ name, created_at: new Date().toISOString(), metadata: { size: blob?.size || 0 } })
      return Promise.resolve({ error: null })
    },
    list:     ()       => Promise.resolve({ data: _STORAGE[bucket] || [], error: null }),
    download: ()       => Promise.resolve({ data: new Blob(['{}'], { type:'application/json' }), error: null }),
    getPublicUrl: (name) => ({ data: { publicUrl: `data:image/png;base64,_demo_${name}` } }),
  }
}

// ─── Mock Auth ────────────────────────────────────────
const _mockAuth = {
  getSession: () => {
    const stored = sessionStorage.getItem('current_user')
    if (stored) {
      const u = JSON.parse(stored)
      return Promise.resolve({ data: { session: { user: { id: u.id, email: u.username + USER_DOMAIN } } } })
    }
    return Promise.resolve({ data: { session: null } })
  },
  signInWithPassword: ({ email, password }) => {
    const username = email.replace(USER_DOMAIN, '').toLowerCase()
    if (_DEMO_CREDS[username] !== undefined && _DEMO_CREDS[username] === password) {
      const profile = _DB.user_profiles.find(u => u.username === username && u.active !== false)
      if (!profile) return Promise.resolve({ error: { message: '비활성화된 계정입니다.' } })
      const user = { id: profile.id, username, name: profile.name, role: profile.role, email: profile.email || null }
      sessionStorage.setItem('current_user', JSON.stringify(user))
      return Promise.resolve({ error: null })
    }
    return Promise.resolve({ error: { message: '아이디 또는 비밀번호가 틀렸습니다.' } })
  },
  signUp: ({ email, password }) => {
    const username = email.replace(USER_DOMAIN, '').toLowerCase()
    if (_DEMO_CREDS[username] !== undefined) {
      return Promise.resolve({ error: { message: '이미 존재하는 아이디입니다.' } })
    }
    const newId = 'demo-' + username + '-' + Date.now()
    _DEMO_CREDS[username] = password
    return Promise.resolve({ data: { user: { id: newId } }, error: null })
  },
  signOut: () => {
    sessionStorage.removeItem('current_user')
    return Promise.resolve({ error: null })
  },
}

// ─── Demo Supabase 클라이언트 ─────────────────────────
function _createDemoClient() {
  return {
    auth:    _mockAuth,
    from:    (table) => _mockBuilder(table),
    storage: { from: (bucket) => _mockStorage(bucket) },
  }
}

// ─── 실제 / 데모 클라이언트 초기화 ───────────────────
let sb
if (IS_DEMO) {
  sb = _createDemoClient()
  // fetch 인터셉트: 발송 API 데모 응답
  const _realFetch = window.fetch.bind(window)
  window.fetch = (url, opts) => {
    if (typeof url === 'string' && (
      url.includes('send-kakao') || url.includes('send-sms') || url.includes('send-email')
    )) {
      try {
        const body = JSON.parse(opts?.body || '{}')
        const receivers = body.receivers || []

        // 이메일 발송: email 없는 수신자는 실패 처리
        if (url.includes('send-email')) {
          const results = receivers.map(r => r.email
            ? { name: r.company_name || r.contact_name || '고객사', status: 'success' }
            : { name: r.company_name || r.contact_name || '고객사', status: 'fail', reason: '이메일 미등록' }
          )
          const successCount = results.filter(r => r.status === 'success').length
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: successCount > 0,
              message: `${receivers.length}건 중 ${successCount}건 발송 완료 (데모 모드)`,
              successCount, failCount: receivers.length - successCount, results
            })
          })
        }

        // SMS 발송: phone 없는 수신자는 실패 처리
        if (url.includes('send-sms')) {
          const results = receivers.map(r => r.phone
            ? { name: r.company_name || r.contact_name || '고객사', status: 'success' }
            : { name: r.company_name || r.contact_name || '고객사', status: 'fail', reason: '연락처 미등록' }
          )
          const successCount = results.filter(r => r.status === 'success').length
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: successCount > 0,
              message: `${receivers.length}건 중 ${successCount}건 성공 (데모 모드)`,
              successCount, failCount: receivers.length - successCount, results
            })
          })
        }

        // 카카오 알림톡
        const count = receivers.length
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: `${count}건 중 ${count}건 성공 (데모 모드)`,
            successCount: count,
            failCount: 0,
            results: receivers.map(r => ({
              name: r.company_name || r.contact_name || '고객사',
              status: 'success'
            }))
          })
        })
      } catch { /* fallthrough */ }
    }
    return _realFetch(url, opts)
  }
} else {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
}

// ─── 공통 유틸 ────────────────────────────────────────

/** 로그인 확인 → 사용자 객체 반환 (미로그인 시 login.html 이동) */
async function requireAuth() {
  // sessionStorage에 저장된 사용자 정보 우선 확인
  const stored = sessionStorage.getItem('current_user')
  if (stored) return JSON.parse(stored)

  if (!IS_DEMO) {
    // 프로덕션: Supabase 세션 복원 (페이지 새로고침 대응)
    const { data: { session } } = await sb.auth.getSession()
    if (session) {
      const { data: profile } = await sb.from('user_profiles')
        .select('*').eq('id', session.user.id).single()
      const username = session.user.email.replace(USER_DOMAIN, '')
      const user = {
        id:       session.user.id,
        username,
        name:     profile?.name || username,
        role:     profile?.role || 'user',
        email:    profile?.email || null,
      }
      sessionStorage.setItem('current_user', JSON.stringify(user))
      return user
    }
  }

  window.location.href = '/login.html'
  return null
}

/** 현재 로그인된 사용자 정보 반환 */
function getCurrentUser() {
  const stored = sessionStorage.getItem('current_user')
  return stored ? JSON.parse(stored) : null
}

/** 권한에 따라 네비게이션 표시/숨김 처리 */
function setupNavByRole(role) {
  const isAdmin = role === 'admin'
  document.querySelectorAll('[data-role="admin"]').forEach(el => {
    el.style.display = isAdmin ? '' : 'none'
  })
  const nameEl = document.getElementById('navUserName')
  if (nameEl) {
    const user = getCurrentUser()
    if (user) {
      nameEl.textContent = user.name
      nameEl.title = roleLabel(user.role)
    }
  }
}

/** 역할 한글 레이블 */
function roleLabel(role) {
  return role === 'admin' ? '관리자' : '일반사용자'
}

/** 로그아웃 (모든 페이지 공용) */
async function logout() {
  sessionStorage.removeItem('current_user')
  if (!IS_DEMO) await sb.auth.signOut()
  goto('/login.html')
}

function showToast(msg, type = 'success') {
  const cfg = {
    success: { bg:'#ecfdf5', bdr:'#059669', txt:'#065f46', icon:'✓' },
    danger:  { bg:'#fff1f2', bdr:'#e11d48', txt:'#9f1239', icon:'✕' },
    warning: { bg:'#fffbeb', bdr:'#d97706', txt:'#92400e', icon:'!' },
    info:    { bg:'#eff6ff', bdr:'#2563eb', txt:'#1e40af', icon:'i' },
  }
  const c = cfg[type] || cfg.info

  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed; bottom:24px; right:20px; z-index:9999;
    display:flex; align-items:flex-start; gap:10px;
    background:${c.bg}; border:1px solid ${c.bdr}33;
    border-left:3px solid ${c.bdr};
    padding:12px 16px 12px 14px; border-radius:10px;
    box-shadow:0 4px 20px rgba(0,0,0,.13);
    max-width:320px; min-width:200px;
    font-size:13.5px; font-family:inherit;
    animation:toastIn .22s cubic-bezier(.16,1,.3,1) both;
  `
  const icon = document.createElement('div')
  icon.style.cssText = `
    width:20px; height:20px; border-radius:50%;
    background:${c.bdr}; color:#fff; font-size:11px; font-weight:700;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; margin-top:1px;
  `
  icon.textContent = c.icon

  const text = document.createElement('div')
  text.style.cssText = `color:${c.txt}; line-height:1.45; word-break:break-word;`
  text.textContent = msg

  el.append(icon, text)
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.transition = 'opacity .2s, transform .2s'
    el.style.opacity = '0'
    el.style.transform = 'translateX(16px)'
    setTimeout(() => el.remove(), 220)
  }, 3500)
}

function goto(path) { window.location.href = path }

// ─── 데모 배너 ────────────────────────────────────────
if (IS_DEMO) {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login')) return
    const bar = document.createElement('div')
    bar.style.cssText = `
      background:linear-gradient(90deg,#4f46e5,#7c3aed);
      color:#fff; font-size:12px; font-weight:600;
      text-align:center; padding:7px 16px; letter-spacing:0.2px;
      position:sticky; top:0; z-index:9999;
    `
    bar.innerHTML = `
      🚀 <strong>데모 모드</strong> — 관리자: <code style="background:rgba(255,255,255,.2);padding:1px 5px;border-radius:3px">admin / admin123</code>
      &nbsp;|&nbsp; 일반사용자: <code style="background:rgba(255,255,255,.2);padding:1px 5px;border-radius:3px">user1 / user123</code>
    `
    document.body.prepend(bar)
  })
}
