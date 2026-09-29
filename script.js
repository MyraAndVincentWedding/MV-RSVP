/* ========================================
   Myra & Vincent — Wedding Website Scripts
   ======================================== */

(function () {
  'use strict';

  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQOiwiJSjLf0Y9Bwo2X_blPHTTzvshOS3XC4ZngTe0greB1pREd0yiZEPQ4SyIoqE/exec';
  var WEDDING_DATE = new Date('2026-10-28T14:00:00+08:00');
  var HASHTAG = '#HeaVincentToMyra';

  /* ---------- Intro Overlay (wave video) ---------- */
  function initIntro() {
    var overlay = document.getElementById('introOverlay');
    if (!overlay) return;
    document.body.style.overflow = 'hidden';

    // Greet the guest by name when they arrive via their personal link
    var introTag = document.getElementById('introTag');
    var introName = new URLSearchParams(window.location.search).get('name');
    if (introTag && introName) introTag.textContent = 'Hello, ' + introName;

    var vid = document.getElementById('introVideo');
    if (vid) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        vid.removeAttribute('autoplay');
        vid.pause();
      } else {
        var play = vid.play();
        if (play && play.catch) play.catch(function () {});
      }
    }


    // Names/tagline land by ~2.9s, loading bar fills by ~6.8s - dismiss at 7s
    setTimeout(function () {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      if (vid) vid.pause();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      document.dispatchEvent(new Event('introDone'));
      setTimeout(function () { overlay.style.display = 'none'; }, 1000);
    }, 7000);
  }
  /* ---------- Navigation ---------- */
  function initNav() {
    var nav = document.getElementById('nav');
    var hamburger = document.getElementById('navHamburger');
    var mobileMenu = document.getElementById('navMobileMenu');
    if (!nav) return;

    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
      });
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('open');
        });
      });
    }
  }

  /* ---------- Smooth scroll (respects fixed nav) ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    var dEl = document.getElementById('days');
    var hEl = document.getElementById('hours');
    var mEl = document.getElementById('minutes');
    var sEl = document.getElementById('seconds');
    if (!dEl) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function update() {
      var diff = WEDDING_DATE - new Date();
      if (diff <= 0) {
        dEl.textContent = '00';
        hEl.textContent = '00';
        mEl.textContent = '00';
        sEl.textContent = '00';
        return;
      }
      dEl.textContent = Math.floor(diff / 86400000);
      hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
      sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    update();
    setInterval(update, 1000);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { observer.observe(el); });

    // Safety net: if an in-view element somehow missed the observer, reveal it
    setTimeout(function () {
      els.forEach(function (el) {
        if (el.classList.contains('revealed')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('revealed');
      });
    }, 2500);
  }

  /* ---------- Deadline badge ---------- */
  function initDeadlineBadge() {
    var badge = document.getElementById('deadlineBadge');
    if (!badge) return;
    window.addEventListener('scroll', function () {
      badge.classList.toggle('visible', window.scrollY > window.innerHeight * 0.6);
    }, { passive: true });
  }

  /* ---------- Entourage people (staggered entrance) ---------- */
  function initEntourage() {
    var sheet = document.querySelector('.entourage-sheet');
    if (!sheet) return;
    var cards = Array.prototype.slice.call(sheet.querySelectorAll('.ent-person'));
    if (!cards.length) return;

    // Stagger index resets per block so long lists don't reveal sluggishly
    Array.prototype.forEach.call(sheet.querySelectorAll('.ent-block'), function (block) {
      Array.prototype.forEach.call(block.querySelectorAll('.ent-person'), function (card, i) {
        card.style.setProperty('--i', i);
      });
    });

    // Staggered entrance when the sheet scrolls into view
    sheet.classList.add('stagger');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            sheet.classList.add('is-visible');
            io.disconnect();
          }
        });
      }, { threshold: 0.1 });
      io.observe(sheet);
    } else {
      sheet.classList.add('is-visible');
    }
  }

  /* ---------- Palette swatches (one set per theme card) ---------- */
  function initPalette() {
    var cards = document.querySelectorAll('.theme-card');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var stage = card.querySelector('.attire-stage');
      var swatches = card.querySelectorAll('.palette-swatch');
      if (!stage || !swatches.length) return;

      function applyColor(color) {
        stage.style.backgroundColor = color;
      }

      // Default = the swatch marked active in this card's HTML
      var active = card.querySelector('.palette-swatch.active');
      if (active) applyColor(active.getAttribute('data-color'));

      swatches.forEach(function (swatch) {
        swatch.addEventListener('click', function () {
          swatches.forEach(function (s) { s.classList.remove('active'); });
          swatch.classList.add('active');
          applyColor(swatch.getAttribute('data-color'));
        });
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach(function (open) {
          open.classList.remove('active');
          open.querySelector('.faq-answer').style.maxHeight = null;
          open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- Hashtag copy ---------- */
  function initHashtagCopy() {
    var btn = document.getElementById('copyHashtag');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var original = btn.innerHTML;
      var done = function () {
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = original;
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(HASHTAG).then(done, done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = HASHTAG;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      }
    });
  }

  /* ---------- Album coverflow (ported from album.html) ---------- */
  var ALBUM_PHOTOS = [
    '1e_FmQG_8qiXgghg4bProTZ-925K6mkb5', '1JytlSrYFjRJLHRDnGBm4mErShLrbUJma',
    '1rxn5JDI6-AJJJqFJrxRSbruGKNy4TxTD', '1pqJNpMHRGOnEAzQlvu40qh5cy13dJe2f',
    '1ty5ME9uiKC0BylIE1XOTBMYXj5vo1JgQ', '1_PPeTd-MjqTPsYRoa2LqDmjhPWkQljJ_',
    '1gEmQH6zc1rhgkxobOBMuQ3VDm_zMvLdS', '1Q89UFQ8CWPHXJFUsqNM8t2TwMhtL4qTN',
    '1TfzOKtbKW3enorJUZrjs60JfM9IFt7p6', '17g_ANJNELFry2ezISGUYhH9qiiy7QOOR',
    '1tQv_TCFFUwMpxCtmvAL_OxOFdnlzSXGV', '11u7K0Mqmu-Xr4VTpZnTeTAW4pVZPoyNb',
    '12FSMG9CZAXFOvil_vb10SKy4eTu0vjW-', '1p0RsMrAljQhK6-vALnvNp2XyWiDvrPI8',
    '1iSxu6L8K6qhTn7f1ezLvHBUp2H11RDtI', '1ModxBK0Su9JrBcEj81RdICCXjOvkHcRI',
    '1BmsrnTTKvESYaWQpVVE6gybdExWdEpvL', '1vCt2KW7LJFownD582SrDCJi_Tu9oZAqh',
    '1-U2gCHDqBUqCQMfhjdqBiE5TPkUFQUkj', '1wlmX2Ku1ZJ0d_DctN_4-3Vzp7iuToyjf',
    '1nwp19blWnHQn_Mn11TaFWLlZg6OV-UMX', '10CvKB_JHsnpsnB99-gq80FANKGQpCxPk',
    '1ZcDQV4487dcDNiLUnQKb7b9OAdaAsgPf', '1X5jNWVxgLknuklL0S4JASpEErZpTD7gC',
    '1isjN4I-BL7mjIeSWLW_EXipL8lKviwRy', '1eIHywHPlw69ODqSL0FYvmGBeqc9b8Dgc',
    '1Wsee5QSvjXx9WZA3rzHBA7Hl2Idb4H9L', '1VipYMyZEjkwg4LobBD9LwNmR_U9xY672',
    '1gA5Pu6_VkpCD6zNXF001mvcY0cmKfqGT', '1pRoPr8iX2nv7aBliUhigU9Wt9eWCyRz_',
    '1BPzeWbUxOlQDDCoOx10bBgvD0TWeFuUd', '1jHKfi9XFuSXljR9gTeG1FRs85KDHay-l',
    '1pRKRVzRE5Oiswr8F1Vmn4IM0OLwT8S5K', '1XsiHyO_ANSNz1Yzd_eB4ZXmztWmTWkn8',
    '1ymL5A_FSClCWRbbiHmiSr_JzrEgX-6MN', '1G_kdhMUFOfJQr4msdnCZ5lKo7n5aOh4L',
    '1bvb19_n6gL-2WyJARpdsfv2MPEfUpC8b', '1HurDrqr_WZI3VbjXhQzxgw1Kh4iyb7F9',
    '1Z9b9Bc7HyAr2ah5KCZk9Q3i_KosRWZEa', '1cdkyx8q8HI8by1dxoGupsWWQs_nRuAvS',
    '1rvjr0RZy0j8p_Xy_xULGZf9O6rJGjNpa'
  ];

  function initCoverflow() {
    var section = document.getElementById('coverflowSection');
    var stage = document.getElementById('coverflowStage');
    var track = document.getElementById('coverflowTrack');
    if (!section || !stage || !track) return;
    if (typeof gsap === 'undefined') return;

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCounter = document.getElementById('lightboxCounter');
    var counterEl = document.getElementById('coverflowCounter');
    var hintEl = document.getElementById('coverflowHint');

    var photos = ALBUM_PHOTOS.slice();
    for (var si = photos.length - 1; si > 0; si--) {
      var sj = Math.floor(Math.random() * (si + 1));
      var stmp = photos[si]; photos[si] = photos[sj]; photos[sj] = stmp;
    }
    var isMobile = window.innerWidth <= 768;
    var currentIndex = 0;
    var lightboxIndex = 0;
    var sectionVisible = false;
    var suppressClick = false;

    var ARC_CARD_W, ARC_CARD_H, ARC_SPACING, ARC_ANGLE_STEP, ARC_CURVE, ARC_SCALE_STEP, ARC_VISIBLE_RANGE;

    function updateSizes() {
      isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        if (window.innerWidth < 1024) {
          ARC_CARD_W = 220; ARC_CARD_H = 285; ARC_SPACING = 150;
        } else {
          ARC_CARD_W = 310; ARC_CARD_H = 400; ARC_SPACING = 205;
        }
        ARC_ANGLE_STEP = 6;
        ARC_CURVE = 8;
        ARC_SCALE_STEP = 0.045;
        ARC_VISIBLE_RANGE = 7;
      }
      if (hintEl) hintEl.textContent = isMobile ? 'swipe to browse' : 'drag to browse';
    }
    updateSizes();

    function getPhotoUrl(id) {
      return 'https://drive.google.com/thumbnail?id=' + id + '&sz=s800';
    }
    function getFullUrl(id) {
      return 'https://drive.google.com/thumbnail?id=' + id + '&sz=s1600';
    }

    function updateCounter() {
      if (counterEl) counterEl.textContent = (currentIndex + 1) + ' / ' + photos.length;
    }

    /* --- Bubbles --- */
    (function createBubbles() {
      var container = document.getElementById('albumBubbles');
      if (!container) return;
      for (var i = 0; i < 15; i++) {
        var bubble = document.createElement('div');
        bubble.className = 'album-bubble';
        var size = Math.random() * 20 + 6;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDuration = (Math.random() * 10 + 8) + 's';
        bubble.style.animationDelay = (Math.random() * 6) + 's';
        container.appendChild(bubble);
      }
    })();

    /* --- Build cards --- */
    function buildCoverflow() {
      track.innerHTML = '';
      photos.forEach(function (id, i) {
        var card = document.createElement('div');
        card.className = 'coverflow-card';
        card.dataset.index = i;

        var img = document.createElement('img');
        img.src = getPhotoUrl(id);
        img.alt = 'Photo ' + (i + 1);
        img.loading = 'lazy';
        img.draggable = false;

        card.appendChild(img);
        track.appendChild(card);

        card.addEventListener('click', function () {
          if (dragMoved || suppressClick) return;
          if (i === currentIndex) {
            openLightbox(i);
          } else {
            currentIndex = i;
            updatePositions();
            resetInactivityTimer();
          }
        });

        card.addEventListener('mouseenter', function () {
          if (isMobile || isDragging) return;
          gsap.to(card, { y: '-=16', scale: '*=1.07', duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', function () {
          if (isMobile || isDragging) return;
          updatePositions();
        });
      });
      updatePositions();
    }

    /* --- Positions --- */
    function updatePositions() {
      var cards = track.querySelectorAll('.coverflow-card');
      updateCounter();

      if (isMobile) {
        /* 3D circle gallery: cards orbit a cylinder, center card faces viewer */
        var n = photos.length;
        cards.forEach(function (card, i) {
          var offset = i - currentIndex;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          var abs = Math.abs(offset);
          card.classList.toggle('center', offset === 0);
          if (abs > 3) { card.style.display = 'none'; card.style.transform = ''; return; }
          card.style.display = '';
          var angle = offset * 25;
          card.style.width = '215px';
          card.style.height = '280px';
          card.style.left = '50%';
          card.style.top = '48%';
          card.style.zIndex = String(30 - Math.round(abs * 4));
          card.style.opacity = String(Math.max(0.4, 1 - abs * 0.15));
          card.style.transform = 'translate(-50%, -50%) translateZ(-290px) rotateY(' + angle + 'deg) translateZ(290px) scale(' + (offset === 0 ? 1.05 : 1) + ')';
        });
        return;
      }

      cards.forEach(function (card, i) {
        var offset = i - currentIndex;
        var absOffset = Math.abs(offset);

        card.classList.toggle('center', offset === 0);

        if (absOffset > ARC_VISIBLE_RANGE) {
          card.style.display = 'none';
          return;
        }
        card.style.display = '';

        var x = offset * ARC_SPACING;
        var y = Math.pow(absOffset, 1.4) * ARC_CURVE;
        var rotate = Math.max(-60, Math.min(60, offset * ARC_ANGLE_STEP));
        var scale = Math.max(1 - absOffset * ARC_SCALE_STEP, 0.55);
        var zIndex = 100 - Math.round(absOffset);

        gsap.to(card, {
          width: ARC_CARD_W, height: ARC_CARD_H,
          x: x, y: y,
          xPercent: 0, yPercent: 0,
          rotation: rotate,
          rotateY: 0,
          z: 0,
          scale: scale,
          opacity: 1,
          zIndex: zIndex,
          duration: 0.5,
          ease: 'power2.out'
        });
      });
    }

    function applyDragPosition(pos) {
      if (isMobile) return;
      var cards = track.querySelectorAll('.coverflow-card');
      cards.forEach(function (card, i) {
        var offset = i - pos;
        var absOffset = Math.abs(offset);

        card.classList.toggle('center', absOffset < 0.5);

        if (absOffset > ARC_VISIBLE_RANGE) {
          card.style.display = 'none';
          return;
        }
        card.style.display = '';

        var x = offset * ARC_SPACING;
        var y = Math.pow(absOffset, 1.4) * ARC_CURVE;
        var rotate = Math.max(-60, Math.min(60, offset * ARC_ANGLE_STEP));
        var scale = Math.max(1 - absOffset * ARC_SCALE_STEP, 0.55);
        var zIndex = 100 - Math.round(absOffset);

        // gsap.set keeps GSAP's transform cache in sync with the dragged
        // position, so the release tween starts from here (not stale values)
        gsap.set(card, {
          width: ARC_CARD_W, height: ARC_CARD_H,
          x: x, y: y,
          xPercent: 0, yPercent: 0,
          rotation: rotate,
          z: 0,
          scale: scale,
          opacity: 1,
          zIndex: zIndex
        });
      });
    }

    /* --- Navigation --- */
    function goTo(index) {
      var newIndex = Math.max(0, Math.min(index, photos.length - 1));
      if (newIndex === currentIndex) return;
      currentIndex = newIndex;
      updatePositions();
    }

    function goNext() {
      if (currentIndex < photos.length - 1) goTo(currentIndex + 1);
    }
    function goPrev() {
      if (currentIndex > 0) goTo(currentIndex - 1);
    }

    /* --- Auto-advance (only while section is on screen) --- */
    var autoAdvanceInterval;
    var inactivityTimer;

    function startAutoAdvance() {
      clearInterval(autoAdvanceInterval);
      autoAdvanceInterval = setInterval(function () {
        if (currentIndex < photos.length - 1) {
          goTo(currentIndex + 1);
        } else {
          goTo(0);
        }
      }, 3000);
    }
    function stopAutoAdvance() {
      clearInterval(autoAdvanceInterval);
    }
    function resetInactivityTimer() {
      stopAutoAdvance();
      clearTimeout(inactivityTimer);
      if (sectionVisible) {
        inactivityTimer = setTimeout(startAutoAdvance, 8000);
      }
    }

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sectionVisible = entry.isIntersecting;
        if (sectionVisible) {
          resetInactivityTimer();
        } else {
          stopAutoAdvance();
          clearTimeout(inactivityTimer);
        }
      });
    }, { threshold: 0.35 });
    sectionObserver.observe(section);

    /* --- Keyboard (only while section is on screen) --- */
    document.addEventListener('keydown', function (e) {
      if (lightbox.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextLightbox();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevLightbox();
        return;
      }
      if (!sectionVisible) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { goNext(); resetInactivityTimer(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { goPrev(); resetInactivityTimer(); }
    });

    /* --- Drag (desktop) --- */
    var isDragging = false;
    var dragMoved = false;
    var dragStartX = 0;
    var dragStartIndex = 0;
    var dragOffset = 0;
    var mouseDownX = 0;
    var mouseDownY = 0;

    stage.addEventListener('mousedown', function (e) {
      e.preventDefault();
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartIndex = currentIndex;
      dragOffset = 0;
      stopAutoAdvance();
      gsap.killTweensOf(track.querySelectorAll('.coverflow-card'));
      stage.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;
      dragOffset = -dx / ARC_SPACING;
      var rawIndex = dragStartIndex + dragOffset;
      var clampedIndex = Math.max(-0.5, Math.min(rawIndex, photos.length - 0.5));
      applyDragPosition(clampedIndex);
    });

    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      stage.style.cursor = 'grab';
      var rawIndex = dragStartIndex + dragOffset;
      var snapped = Math.round(rawIndex);
      currentIndex = Math.max(0, Math.min(snapped, photos.length - 1));
      updatePositions();
      resetInactivityTimer();
      setTimeout(function () { dragMoved = false; }, 50);
    });

    /* --- Touch swipe --- */
    var touchStartX = 0, touchStartY = 0, touchStartTime = 0;

    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      stopAutoAdvance();
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      var elapsed = Date.now() - touchStartTime;

      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) && elapsed < 500) {
        if (dx < 0) goNext();
        else goPrev();
        resetInactivityTimer();
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 400);
      }
    });

    /* --- Tap to open lightbox --- */
    stage.addEventListener('click', function (e) {
      if (suppressClick) return;
      var dx = Math.abs(e.clientX - mouseDownX);
      var dy = Math.abs(e.clientY - mouseDownY);
      if (dx > 5 || dy > 5) return;
      if (isMobile) {
        if (e.target.closest('.coverflow-card')) return;
        if (e.target.closest('#flipbookFrame')) openLightbox(currentIndex);
      }
    });
    stage.addEventListener('mousedown', function (e) { mouseDownX = e.clientX; mouseDownY = e.clientY; });
    stage.addEventListener('touchstart', function (e) { mouseDownX = e.touches[0].clientX; mouseDownY = e.touches[0].clientY; }, { passive: true });

    // Desktop: tap on flipbook frame opens lightbox too
    var frame = document.getElementById('flipbookFrame');
    if (frame) {
      frame.addEventListener('dblclick', function () { openLightbox(currentIndex); });
    }

    /* --- Lightbox --- */
    function openLightbox(index) {
      lightboxIndex = index;
      updateLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      gsap.fromTo(lightboxImg, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    function closeLightbox() {
      gsap.to(lightboxImg, {
        scale: 0.85, opacity: 0, duration: 0.3,
        onComplete: function () {
          lightbox.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
    function updateLightbox() {
      lightboxImg.src = getFullUrl(photos[lightboxIndex]);
      lightboxCounter.textContent = (lightboxIndex + 1) + ' / ' + photos.length;
    }
    function nextLightbox() {
      lightboxIndex = (lightboxIndex + 1) % photos.length;
      updateLightbox();
      gsap.fromTo(lightboxImg, { opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 40 : 0 }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
    }
    function prevLightbox() {
      lightboxIndex = (lightboxIndex - 1 + photos.length) % photos.length;
      updateLightbox();
      gsap.fromTo(lightboxImg, { opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? -40 : 0 }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: 'power2.out' });
    }

    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', function (e) { e.stopPropagation(); prevLightbox(); });
    document.getElementById('lightboxNext').addEventListener('click', function (e) { e.stopPropagation(); nextLightbox(); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

    var lbTouchX = 0, lbTouchY = 0;
    lightbox.addEventListener('touchstart', function (e) {
      lbTouchX = e.touches[0].clientX;
      lbTouchY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - lbTouchX;
      var dy = e.changedTouches[0].clientY - lbTouchY;
      if (isMobile) {
        if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) {
          if (dy < 0) nextLightbox();
          else prevLightbox();
        }
      } else {
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) nextLightbox();
          else prevLightbox();
        }
      }
    });

    /* --- Circle gallery arrows (mobile) --- */
    var circlePrevBtn = document.getElementById('circlePrev');
    var circleNextBtn = document.getElementById('circleNext');
    [[circlePrevBtn, goPrev], [circleNextBtn, goNext]].forEach(function (pair) {
      var btn = pair[0];
      if (!btn) return;
      btn.addEventListener('mousedown', function (e) { e.stopPropagation(); });
      btn.addEventListener('touchstart', function (e) { e.stopPropagation(); }, { passive: true });
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pair[1]();
        resetInactivityTimer();
      });
    });

    /* --- Resize --- */
    window.addEventListener('resize', function () {
      updateSizes();
      updatePositions();
    });

    /* --- Start --- */
    buildCoverflow();
    updateCounter();
  }

  /* ---------- RSVP Form ---------- */
  function initRSVPForm() {
    var form = document.getElementById('rsvpForm');
    if (!form) return;

    var attendingFields = document.getElementById('attendingFields');
    var decliningFields = document.getElementById('decliningFields');
    var confirmEl = document.getElementById('rsvpConfirmation');
    var confirmAttending = document.getElementById('confirmAttending');
    var confirmDeclining = document.getElementById('confirmDeclining');
    var errorEl = document.getElementById('rsvpError');

    // Deep-link: ?name=... greets the guest instead of asking for their name
    var params = new URLSearchParams(window.location.search);
    var guestName = params.get('name');
    if (guestName) {
      form.querySelector('#fullName').value = guestName;
      var nameGroup = document.getElementById('nameGroup');
      var helloGroup = document.getElementById('rsvpHello');
      if (nameGroup) nameGroup.style.display = 'none';
      if (helloGroup) {
        helloGroup.style.display = '';
        document.getElementById('rsvpGuestName').textContent = guestName;
      }
    }

    // Returning guest: check for a previous answer before showing the form
    var alreadyEl = document.getElementById('rsvpAlready');
    var submitted = false;
    if (guestName && alreadyEl) {
      form.style.display = 'none';
      var checkSettled = false;
      var revealTimer = setTimeout(function () {
        // never leave guests staring at an empty section if the check is slow
        if (!checkSettled && !submitted) form.style.display = '';
      }, 4000);
      fetch(SCRIPT_URL + '?action=checkGuest&name=' + encodeURIComponent(guestName))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          checkSettled = true;
          clearTimeout(revealTimer);
          if (submitted) return;
          if (!data || !data.found) { form.style.display = ''; return; }
          // guest already started filling the form - don't take it away
          var radioTouched = !!form.querySelector('input[name="attending"]:checked');
          var typedMsg = (form.querySelector('#message').value || form.querySelector('#declineMessage').value).trim();
          if (radioTouched || typedMsg) return;
          var yes = String(data.response || '').trim().toLowerCase() === 'yes';
          document.getElementById('alreadyAnswer').textContent = yes
            ? "You're coming! We're so happy you'll be there."
            : "You won't be able to make it. We'll miss you!";
          var prevMsg = String(data.message || '').trim();
          var msgEl = document.getElementById('alreadyMessage');
          if (prevMsg && prevMsg !== '(no message)') {
            msgEl.textContent = '"' + prevMsg + '"';
            msgEl.style.display = '';
          } else {
            msgEl.style.display = 'none';
          }
          form.style.display = 'none';
          alreadyEl.style.display = '';
          document.getElementById('rsvpChange').addEventListener('click', function () {
            var radio = form.querySelector('input[name="attending"][value="' + (yes ? 'yes' : 'no') + '"]');
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
            var field = form.querySelector(yes ? '#message' : '#declineMessage');
            if (field && prevMsg && prevMsg !== '(no message)') field.value = prevMsg;
            alreadyEl.style.display = 'none';
            form.style.display = '';
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        })
        .catch(function () {
          checkSettled = true;
          clearTimeout(revealTimer);
          if (!submitted) form.style.display = '';
        });
    }

    // Show/hide conditional fields
    form.querySelectorAll('input[name="attending"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var yes = this.value === 'yes';
        attendingFields.style.display = yes ? '' : 'none';
        decliningFields.style.display = yes ? 'none' : '';
      });
    });

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.style.display = msg ? 'block' : 'none';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError('');

      var name = form.querySelector('#fullName').value.trim();
      var response = form.querySelector('input[name="attending"]:checked');
      if (!name) { showError('Please enter your name.'); return; }
      if (!response) { showError('Please select your response.'); return; }

      var attending = response.value === 'yes';
      var message = attending
        ? (form.querySelector('#message').value.trim())
        : (form.querySelector('#declineMessage').value.trim());

      var submitBtn = form.querySelector('.rsvp-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          attending: attending ? 'Yes' : 'No',
          message: message || '(no message)'
        })
      }).then(function () {
        submitted = true;
        form.style.display = 'none';
        confirmEl.style.display = '';
        confirmAttending.style.display = attending ? '' : 'none';
        confirmDeclining.style.display = attending ? 'none' : '';
        confirmEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function () {
        showError('Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send My RSVP';
      });
    });
  }

  /* ---------- Our Story scroll animation ---------- */
  function initStoryScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.timeline-item').forEach(function (item) {
      gsap.from(item, {
        opacity: 0,
        x: item.classList.contains('reverse') ? 80 : -80,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      var imgs = item.querySelectorAll('.timeline-image img');
      if (imgs.length) {
        gsap.fromTo(imgs,
          { scale: 1.12, yPercent: -4 },
          {
            scale: 1.12,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6
            }
          });
      }
    });
  }

  /* ---------- Share buttons: app deep-link on mobile, website on desktop ---------- */
  function initShareLinks() {
    var links = document.querySelectorAll('.share-btn[data-app]');
    if (!links.length) return;
    if (!/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)) return;
    Array.prototype.forEach.call(links, function (a) {
      a.setAttribute('href', a.getAttribute('data-app'));
    });
  }

  /* ---------- Music ---------- */
  function initMusic() {
    var audio = document.getElementById('bgMusic');
    var btn = document.getElementById('musicToggle');
    if (!audio || !btn) return;

    audio.volume = 0.7;
    audio.muted = false;
    audio.autoplay = true;
    var userPaused = false;
    var events = ['pointerdown', 'touchstart', 'keydown', 'wheel'];

    function setUI(playing) {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    }

    function play() {
      var p = audio.play();
      if (p && p.then) {
        p.then(function () { setUI(true); })
         .catch(function () { setUI(false); });
      }
    }

    function unlock() {
      events.forEach(function (e) { window.removeEventListener(e, unlock); });
      if (!userPaused) play();
    }
    events.forEach(function (e) { window.addEventListener(e, unlock, { passive: true }); });

    setUI(false);
    play();

    // Start (unmuted) as soon as the intro overlay hands over to the main page
    document.addEventListener('introDone', function () {
      if (!userPaused && audio.paused) play();
    });

    btn.addEventListener('click', function () {
      if (audio.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        audio.pause();
        setUI(false);
      }
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initIntro();
    initNav();
    initSmoothScroll();
    initCountdown();
    initReveal();
    initStoryScroll();
    initDeadlineBadge();
    initEntourage();
    initPalette();
    initFAQ();
    initHashtagCopy();
    initCoverflow();
    initRSVPForm();
    initMusic();
    initShareLinks();
  });
})();
