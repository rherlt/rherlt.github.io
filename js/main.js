/* Rico Herlt — //rherlt · statische Visitenkarte */

/* ---------- Navbar: Scroll-Effekt (wie in der Original-Webseite) ---------- */
var navbar = document.getElementById('navbar');
function toggleNavbar() {
   if (window.scrollY > 50) navbar.classList.add('scrolled');
   else navbar.classList.remove('scrolled');
}
window.addEventListener('scroll', toggleNavbar, { passive: true });
toggleNavbar();

/* ---------- Mobile Navigation ---------- */
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', function () {
   navLinks.classList.toggle('open');
   navToggle.innerHTML = navLinks.classList.contains('open')
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
});
navLinks.addEventListener('click', function (e) {
   if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
   }
});

/* ---------- Typing-Animation (Builder / typed.js-Effekt der Original-Seite) ---------- */
/* Gleiche Zitate wie in /js/typed.min.js der Ursprungsseite */
var quotes = [
   "Consultant, Software Architect, Cloud-Entwickler aus Berlin und Brandenburg a.d.H.",
   "Ich erstelle Cross-Plattform Apps",
   "Cloud, DevOps &amp; Kubernetes — von der Konzeption bis in Produktion",
   "Security first: BSI-/DSGVO-konforme Identitäts- &amp; Zugangssysteme (IAM)",
   "There is no cloud \u2601.<br>- It\u2019s just someone else\u2019s computer.",
   "Real programmers count from 0.",
   "<strong>Algorithm</strong> <i>(noun.)</i> Word used by programmers when they don\u2019t explain what they did.",
   "<strong>Artificial Intelligence </strong> <i>(noun.)</i> The art of making computers sound confident while humans pretend to understand the answers.",
   "In software, production is the place where your “works on my machine” meets “why does this crash now?”",
   "The best part about being a software developer is that you can add a comment and the compiler will pretend it didn’t exist."
];

function shuffle(a) {
   for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
   }
   return a;
}

function typer(el, strings, opts) {
   opts = opts || {};
   var i = 0, ci = 0, deleting = false;
   el.innerHTML = '<span class="cursor">|</span>';

   function tick() {
      if (!strings.length) return;
      var full = strings[0];
      var out = full.substr(0, ci);

      el.innerHTML = out + '<span class="cursor">|</span>';

      if (!deleting) {
         ci++;
         if (ci > full.length) {
            deleting = true;
            setTimeout(tick, opts.pause || 1600);
            return;
         }
      } else {
         ci--;
         if (ci === 0) {
            deleting = false;
            strings.shift();
            if (!strings.length) strings = shuffle(quotes.slice());
            setTimeout(function () { ci = 0; tick(); }, 250);
            return;
         }
      }
      setTimeout(tick, deleting ? (opts.speed ? opts.speed / 2 : 18) : (opts.speed || 55));
   }
   tick();
}

typer(document.getElementById('typed'), shuffle(quotes.slice()), { speed: 60, pause: 2000 });

/* ---------- Scroll-Reveal ---------- */
var revealTargets = document.querySelectorAll(
   '.section > .container > *:not(.section-title):not(.section-lead), .fact, .skill-card, .t-item, .edu, .project'
);
revealTargets.forEach(function (el) { el.classList.add('reveal'); });

var io = new IntersectionObserver(function (entries) {
   entries.forEach(function (entry) {
      if (entry.isIntersecting) {
         entry.target.classList.add('in');
         io.unobserve(entry.target);
      }
   });
}, { threshold: 0.12 });

revealTargets.forEach(function (el) { io.observe(el); });

/* ---------- Impressum: Footer ausklappen ---------- */
var impressumToggle = document.getElementById('impressumToggle');
var impressum = document.getElementById('impressum');
if (impressumToggle && impressum) {
    impressumToggle.addEventListener('click', function () {
        var open = impressum.classList.toggle('open');
        impressumToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
            var scrolled = false;
            var scrollToBottom = function () {
                if (scrolled || !impressum.classList.contains('open')) return;
                scrolled = true;
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            };
            impressum.addEventListener('transitionend', scrollToBottom);
            setTimeout(scrollToBottom, 500);
        }
    });
}
