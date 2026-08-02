/* =========================================================
   코리아요리아트아카데미 대전점 랜딩페이지 스크립트
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   CONFIG — 배포 전 실제 값으로 교체해야 하는 항목
   - FORM_ENDPOINT : 상담 폼 수신 주소 (구글 앱스 스크립트 웹앱).
     저장소 apps-script/Code.gs를 구글시트에 설치·배포한 뒤
     'https://script.google.com/macros/s/…/exec' URL을 넣으면
     제출 내용이 시트에 쌓이고 이메일 알림이 발송됩니다.
     (Formspree URL을 넣어도 동작하도록 함께 지원)
     비어 있으면 제출 시 전화/카카오톡 안내로 대체됩니다.
   - GA4_ID / NAVER_ID / META_PIXEL_ID : 발급 후 입력하면
     아래 트래킹 부트스트랩이 자동으로 활성화됩니다.
   --------------------------------------------------------- */
var CONFIG = {
  FORM_ENDPOINT: '',
  GA4_ID: '',
  META_PIXEL_ID: '',
  KAKAO_CHANNEL: 'http://pf.kakao.com/_VBKbX/chat',
  TEL: '042-710-5157'
};

/* ===== 트래킹 부트스트랩 (ID가 설정된 경우에만 로드) ===== */
(function initTracking() {
  if (CONFIG.GA4_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.GA4_ID);
  }
  if (CONFIG.META_PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CONFIG.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
})();

/* 전환 이벤트 공통 전송 — 기획서 9.3 (폼 제출/전화/카톡/카드 CTA 분리 추적) */
function track(eventName, params) {
  params = params || {};
  if (window.gtag) window.gtag('event', eventName, params);
  if (window.fbq) window.fbq('trackCustom', eventName, params);
}

document.addEventListener('DOMContentLoaded', function () {

  /* ===== data-track 자동 추적 ===== */
  document.querySelectorAll('.js-track').forEach(function (el) {
    el.addEventListener('click', function () {
      track('cta_click', { cta: el.getAttribute('data-track') || 'unknown' });
    });
  });

  /* ===== 모바일 메뉴 ===== */
  var burger = document.getElementById('burgerBtn');
  var gnb = document.getElementById('gnb');
  if (burger && gnb) {
    burger.addEventListener('click', function () {
      var open = gnb.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    gnb.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        gnb.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ===== 후기 필터 ===== */
  var chips = document.querySelectorAll('.reviews__filter .chip');
  var reviewCards = document.querySelectorAll('.review-card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var f = chip.getAttribute('data-filter');
      reviewCards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !show);
      });
      track('review_filter', { filter: f });
    });
  });

  /* ===== 클래스 카드 CTA → 폼 자동 태깅 (기획서 7.2) ===== */
  var courseSelect = document.getElementById('f-course');
  var interestBoxes = document.querySelectorAll('input[name="interest"]');
  document.querySelectorAll('.js-course-cta').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var course = btn.getAttribute('data-course');
      var cat = btn.getAttribute('data-cat');
      if (courseSelect && course) {
        for (var i = 0; i < courseSelect.options.length; i++) {
          if (courseSelect.options[i].text === course) { courseSelect.selectedIndex = i; break; }
        }
      }
      if (cat) {
        interestBoxes.forEach(function (box) { if (box.value === cat) box.checked = true; });
      }
      track('course_cta_click', { course: course || '', category: cat || '' });
      document.getElementById('contact').scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
    });
  });

  /* ===== 스크롤 50% sticky 바 (기획서 7.2) ===== */
  var sticky = document.getElementById('stickybar');
  var stickyShown = false;
  if (sticky) {
    var onScroll = function () {
      var doc = document.documentElement;
      var ratio = (window.scrollY + window.innerHeight) / doc.scrollHeight;
      var contact = document.getElementById('contact');
      var nearForm = contact && contact.getBoundingClientRect().top < window.innerHeight;
      var show = ratio > 0.5 && !nearForm;
      if (show !== stickyShown) {
        stickyShown = show;
        sticky.hidden = false;
        sticky.classList.toggle('is-visible', show);
        document.body.classList.toggle('has-stickybar', show);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== 스크롤 리빌 ===== */
  if (!prefersReduced() && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.section__inner, .trustbar__inner');
    targets.forEach(function (t) { t.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ===== 상담 폼 ===== */
  var form = document.getElementById('consultForm');
  var result = document.getElementById('formResult');
  if (form) {
    var phoneInput = document.getElementById('f-phone');
    phoneInput.addEventListener('input', function () {
      var v = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 11);
      if (v.length > 7) v = v.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
      else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1-$2');
      phoneInput.value = v;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      result.className = 'contact__result';
      result.textContent = '';

      /* 허니팟 — 봇 차단 */
      if (form.company && form.company.value) return;

      var errors = [];
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var region = form.region.value;
      var interests = Array.prototype.filter.call(interestBoxes, function (b) { return b.checked; })
        .map(function (b) { return b.value; });

      clearErrors(form);
      if (!name) errors.push([form.name, '이름을 입력해 주세요.']);
      if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone)) errors.push([form.phone, '연락처를 010-0000-0000 형식으로 입력해 주세요.']);
      if (!region) errors.push([form.region, '거주지역을 선택해 주세요.']);
      if (interests.length === 0) errors.push([null, '관심 분야를 1개 이상 선택해 주세요.']);
      if (!form.agree.checked) errors.push([null, '개인정보 수집·이용에 동의해 주세요.']);

      if (errors.length) {
        errors.forEach(function (pair) { if (pair[0]) pair[0].classList.add('is-error'); });
        showResult(errors[0][1], false);
        if (errors[0][0]) errors[0][0].focus();
        return;
      }

      var payload = {
        '이름': name,
        '연락처': phone,
        '거주지역': region,
        '관심분야': interests.join(', '),
        '관심클래스': form.course.value || '미정',
        '상담희망시간대': form.time.value || '무관',
        '접수경로': '대전점 요리학과 랜딩페이지'
      };

      if (!CONFIG.FORM_ENDPOINT) {
        /* 폼 백엔드 미연동 상태 안내 (배포 전 CONFIG.FORM_ENDPOINT 설정 필요) */
        showResult('현재 온라인 접수 준비 중입니다. 전화 ' + CONFIG.TEL + ' 또는 카카오톡 채널로 문의해 주세요.', false);
        track('form_submit_blocked', {});
        return;
      }

      var submitBtn = form.querySelector('.contact__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = '접수 중...';

      /* 앱스 스크립트 웹앱은 커스텀 헤더(JSON Content-Type)가 붙으면 CORS
         프리플라이트에 걸려 실패한다 — 헤더 없이 보내면 text/plain 단순 요청이
         되어 통과하고, doPost가 e.postData.contents로 JSON을 파싱한다.
         Formspree는 반대로 application/json 헤더가 필요해 엔드포인트별 분기. */
      var isAppsScript = CONFIG.FORM_ENDPOINT.indexOf('script.google') !== -1;
      var fetchOpts = isAppsScript
        ? { method: 'POST', body: JSON.stringify(payload) }
        : { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) };

      fetch(CONFIG.FORM_ENDPOINT, fetchOpts).then(function (res) {
        if (!res.ok) throw new Error('submit failed: ' + res.status);
        return res.json().catch(function () { return { ok: true }; });
      }).then(function (data) {
        if (data && data.ok === false) throw new Error(data.error || 'server error');
        form.reset();
        showResult('상담 신청이 접수되었습니다. 확인 후 빠르게 연락드리겠습니다!', true);
        track('form_submit_success', { region: region, interests: interests.join(',') });
      }).catch(function () {
        showResult('일시적인 오류로 접수하지 못했습니다. 전화 ' + CONFIG.TEL + '로 문의해 주세요.', false);
        track('form_submit_error', {});
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = '상담 신청하기';
      });
    });
  }

  function clearErrors(f) {
    f.querySelectorAll('.is-error').forEach(function (el) { el.classList.remove('is-error'); });
  }
  function showResult(msg, ok) {
    result.textContent = msg;
    result.className = 'contact__result ' + (ok ? 'is-ok' : 'is-fail');
  }
  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
});
