/**
 * Auth flow smoke test for the landing page.
 *
 * Runs the real app in jsdom: renders <App/>, drives the sign-in / sign-up /
 * guest / theme flows and asserts on the DOM and the fetch calls.
 *
 *   npm run test:smoke
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost:5199/',
  pretendToBeVisual: true,
})

const mm = (q) => ({
  matches: false,
  media: q,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
})

global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element
global.Node = dom.window.Node
global.SVGElement = dom.window.SVGElement || class SVGElement {}
global.getComputedStyle = dom.window.getComputedStyle
global.matchMedia = mm
dom.window.matchMedia = mm
global.localStorage = dom.window.localStorage
global.requestAnimationFrame = (cb) => setTimeout(cb, 16)
global.cancelAnimationFrame = clearTimeout

async function main() {
  const React = (await import('react')).default
  const { createRoot } = await import('react-dom/client')
  const { act } = await import('react-dom/test-utils')
  const App = (await import('../src/App.jsx')).default

  const root = createRoot(document.getElementById('root'))
  const results = []
  const check = (name, cond) => {
    results.push(cond)
    console.log((cond ? 'ok   ' : 'FAIL ') + name)
  }
  const flush = (ms = 40) =>
    act(async () => {
      await new Promise((r) => setTimeout(r, ms))
    })
  const click = async (el) => {
    if (!el) throw new Error('click on missing element')
    await act(async () => {
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }))
    })
    await flush()
  }
  const type = async (sel, v) => {
    const el = document.querySelector(sel)
    if (!el) throw new Error('missing input ' + sel)
    const desc =
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value') ||
      Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')
    await act(async () => {
      desc.set.call(el, v)
      el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    })
    await flush(10)
  }
  const q = (s) => document.querySelector(s)
  const qa = (s) => [...document.querySelectorAll(s)]
  const clickText = (t) => qa('button').find((b) => b.textContent.includes(t))

  await act(async () => {
    root.render(React.createElement(App))
  })
  await flush(80)

  // ─── structure & content ───
  check('headline words', ['Experience', 'Simplicity,', 'Redefined.'].every((w) => document.body.textContent.includes(w)))
  check('primary CTA is "Enter Experience"', document.body.textContent.includes('Enter Experience'))
  check('guest button present', document.body.textContent.includes('Explore as Guest'))
  check('social buttons', qa('button[aria-label*="Apple"], button[aria-label*="Google"]').length === 2)
  check('email input type', q('#email')?.type === 'email')
  check('password input type', q('#password')?.type === 'password')
  check('no name field in sign-in mode', !q('#name'))
  check('floating label is a real <label for>', !!q('label[for="email"]'))
  check('placeholder matches label (drives :placeholder-shown)', q('#email')?.placeholder === 'Email address')
  check('two tabs', qa('[role="tab"]').length === 2)
  check('panel labelled by the selected tab', q('#auth-panel')?.getAttribute('aria-labelledby') === 'tab-signin')

  // ─── keyboard tabs pattern ───
  const signInTab = q('#tab-signin')
  await act(async () => {
    signInTab.focus()
    signInTab.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  })
  await flush()
  check('ArrowRight moves to Sign Up', document.body.textContent.includes('Create Account'))
  check('focused tab is the Sign Up tab', document.activeElement === q('#tab-signup'))
  check('inactive tab is not tabbable', q('#tab-signin')?.tabIndex === -1)
  await act(async () => {
    q('#tab-signup').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'End', bubbles: true }))
  })
  await flush()
  check('End keeps you on the last tab', document.body.textContent.includes('Create Account'))
  await act(async () => {
    q('#tab-signup').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
  })
  await flush()
  check('ArrowLeft returns to Log In', document.body.textContent.includes('Enter Experience'))

  // ─── mode switch ───
  await click(qa('[role="tab"]')[1])
  check('switched to Sign Up CTA', document.body.textContent.includes('Create Account'))
  check('sign-up shows name field', !!q('#name'))
  check('sign-up shows confirm field', !!q('#confirm'))
  check('thumb data-mode flips', q('.segmented__thumb')?.dataset.mode === 'signup')
  check('name input autocomplete', q('#name')?.autocomplete === 'name')
  check('new-password autocomplete', q('#password')?.autocomplete === 'new-password')

  await type('#name', 'Ada Lovelace')
  await type('#email', 'ada@example.com')
  await type('#password', 'supersecret1')
  await type('#confirm', 'nope')
  await click(q('button[type="submit"]'))
  check('mismatch error shown', document.body.textContent.includes('Passwords do not match'))

  await type('#confirm', 'short')
  await type('#password', 'short')
  await click(q('button[type="submit"]'))
  check('short password rejected', document.body.textContent.includes('at least 8 characters'))

  const toggle = qa('button').find((b) => b.textContent.trim() === 'Show')
  await click(toggle)
  check('password reveal toggles type', q('#password')?.type === 'text')
  check('confirm field follows reveal', q('#confirm')?.type === 'text')

  await click(qa('[role="tab"]')[0])
  check('back to Log In CTA', document.body.textContent.includes('Enter Experience'))
  check('sign-up fields removed', !q('#name') && !q('#confirm'))

  // ─── theme ───
  const initialDark = document.documentElement.classList.contains('dark')
  await click(q('button[aria-label*="Switch to"]'))
  check('theme flips <html> class', document.documentElement.classList.contains('dark') === !initialDark)
  check('theme persisted', localStorage.getItem('aurelia-theme') === document.documentElement.dataset.theme)
  await click(q('button[aria-label*="Switch to"]'))

  // ─── mocked API ───
  const calls = []
  let loginEmail = 'ada@example.com'
  global.fetch = async (url, opts) => {
    lastBody = { url, body: JSON.parse(opts?.body || '{}') }
    calls.push(lastBody)
    const badLogin = String(url).includes('/login/') && lastBody.body.password === 'wrongpass'
    const ok = !badLogin
    return {
      ok,
      status: ok ? 200 : 400,
      json: async () =>
        ok
          ? {
              message: 'ok',
              user: {
                id: 1,
                email: loginEmail || lastBody.body.email || 'ada@example.com',
                username: ((loginEmail || lastBody.body.email || 'ada').split('@')[0]),
                first_name: 'Ada',
                last_name: 'Lovelace',
                is_active: true,
              },
              tokens: { access_token: 'jwt-abc', refresh_token: 'r' },
            }
          : { error: { detail: 'No active account found with the given credentials.', code: 'auth_failed' } },
    }
  }

  await type('#email', 'nobody@example.com')
  await type('#password', 'wrongpass')
  await click(q('button[type="submit"]'))
  check('backend error detail surfaced', document.body.textContent.includes('No active account found with the given credentials'))
  check('error has role=alert', !!q('[role="alert"]'))
  check('loading state cleared', !document.body.textContent.includes('Entering'))

  await type('#email', 'ada@example.com')
  loginEmail = 'ada@example.com'
  await type('#password', 'correct-horse')
  await click(q('button[type="submit"]'))
  await flush
  const loginCalls = calls.filter((c) => c.url.endsWith('/auth/login/'))
  const loginCall = loginCalls.find((c) => c.body.password === 'correct-horse')
  check('login posted to the right URL', !!loginCall)
  check('two login attempts made (fail then success)', loginCalls.length === 2)
  check('login posted email+password', loginCall?.body.email === 'ada@example.com' && loginCall?.body.password === 'correct-horse')
  check('signed-in dashboard greets user', document.body.textContent.includes('Welcome,'))
  check('dashboard shows email', document.body.textContent.includes('ada@example.com'))
  check('dashboard shows full name', document.body.textContent.includes('Ada Lovelace'))
  check('token persisted to storage', (localStorage.getItem('auth-storage') || '').includes('jwt-abc'))

  await click(clickText('Log out'))
  await flush(80)
  await click(qa('[role="tab"]')[1])
  await flush(60)
  await type('#name', 'Grace Hopper')
  await type('#email', 'grace@example.com')
  await type('#password', 'nanoseconds')
  await type('#confirm', 'nanoseconds')
  await click(q('button[type="submit"]'))
  await flush(80)
  const regCall = calls.find((c) => c.url.endsWith('/auth/register/'))
  check('register posted to the right URL', !!regCall)
  check('register splits the full name', regCall?.body.first_name === 'Grace' && regCall?.body.last_name === 'Hopper')
  check('register username derived from email', regCall?.body.username === 'grace')

  // ─── guest ───
  await click(clickText('Log out'))
  await flush(80)
  await click(clickText('Explore as Guest'))
  await flush(120)
  check('guest reaches dashboard', document.body.textContent.includes('exploring as a'))
  check('guest sees upsell', document.body.textContent.includes('Create an account'))
  check('guest has no session rows', !document.body.textContent.includes('Bearer token'))
  await click(clickText('Leave guest mode'))
  await flush(120)
  check('leaving guest returns to landing', document.body.textContent.includes('Explore as Guest'))

  console.log('\nPASS ' + results.filter(Boolean).length + '/' + results.length)
  process.exit(results.every(Boolean) ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
