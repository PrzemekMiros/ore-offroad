function animationMain() {
  window.scrollTo(0, 0);
  gsap.registerPlugin(ScrollTrigger);

  // Inicjalizacja Lenis do płynnego przewijania
  const lenis = new Lenis({
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.1,
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.5,
    wheelMultiplier: 1,
    infinite: false,
    autoResize: true
  });

  // Funkcja do przewijania do sekcji
  function scrollToSection(targetPosition) {
    lenis.scrollTo(targetPosition);
  }

  // Obsługa kliknięć w linki przewijające
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const currentScroll = window.scrollY;
        let offsetPosition = elementPosition > currentScroll ? elementPosition - 35 : elementPosition - 115;
        scrollToSection(offsetPosition);
      }
    });
  });

  // Synchronizacja Lenis z ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));

  // Animacje dla dużych ekranów
  if (window.matchMedia("(min-width: 767px)").matches) {
    // Animacje dla tekstu podzielonego na linie
    const splitTextLines = document.querySelectorAll(".split-lines");
    splitTextLines.forEach(element => {
      const mySplitText = new SplitText(element, { type: "lines", linesClass: "line" });
      new SplitText(element, { type: "lines", linesClass: "line-parent" });

      gsap.from(mySplitText.lines, {
        duration: 0.65,
        delay: 0.4,
        stagger: 0.05,
        yPercent: 105,
        ease: "power2",
        scrollTrigger: {
          trigger: element,
          start: "top 95%",
        },
      });
    });

    // Animacje dla podświetlenia tekstu
    const textHighlights = document.querySelectorAll(".text-highlight");
    textHighlights.forEach(textHighlight => {
      const splitText = new SplitText(textHighlight, { type: "lines, chars", charsClass: "char-highlight" });
      const tlh = gsap.timeline({
        scrollTrigger: {
          trigger: textHighlight,
          scrub: 1,
          start: "top 70%",
          end: "bottom 80%",
        },
      });
      tlh.from(".char-highlight", { opacity: 0.2, stagger: 0.3 });
    });

    // Animacje fade-in
    const boxes = gsap.utils.toArray('.fade-in');
    boxes.forEach(fadeElement => {
      const anim = gsap.fromTo(fadeElement, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.75, delay: 0.4 });
      ScrollTrigger.create({ trigger: fadeElement, animation: anim, once: true });
    });

    // Animacje linii
    const lineX = gsap.utils.toArray(".line-x");
    lineX.forEach(lineXItem => {
      gsap.from(lineXItem, {
        width: "0",
        duration: 0.75,
        delay: 0.4,
        ease: "power2.inOut",
        scrollTrigger: { trigger: lineXItem, start: "top 90%" },
      });
    });

    // Animacje parallax
    gsap.utils.toArray(".parallax-wrap").forEach(container => {
      const image = container.querySelector("picture img");
      gsap.set(container, { overflow: "hidden" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          scrub: true,
          pin: false,
        },
      });
      tl.from(image, { yPercent: -9, ease: "none" }).to(image, { yPercent: 9, ease: "none" });
    });

    // Animacje parallax dla stopki
    gsap.from(".footer-parallax", {
      opacity: 0,
      y: "-25%",
      scrollTrigger: {
        trigger: ".footer-parallax",
        start: "top bottom",
        end: "bottom 85%",
        scrub: true,
      },
    });

    // Animacje magnetyczne
    const magnets = document.querySelectorAll('.magnetic');
    const strength = 100;

    magnets.forEach(magnet => {
      magnet.addEventListener('mousemove', moveMagnet);
      magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, 1.5, { x: 0, y: 0, ease: 'Elastic.easeOut' });
        gsap.to(magnet.querySelector(".btn-text"), 1.5, { x: 0, y: 0, ease: 'Elastic.easeOut' });
      });
    });

    function moveMagnet(event) {
      const magnetButton = event.currentTarget;
      const bounding = magnetButton.getBoundingClientRect();
      const magnetsStrength = magnetButton.getAttribute("data-strength");
      const magnetText = magnetButton.querySelector(".btn-text");

      gsap.to(magnetButton, {
        x: (((event.clientX - bounding.left) / magnetButton.offsetWidth) - 0.5) * magnetsStrength,
        y: (((event.clientY - bounding.top) / magnetButton.offsetHeight) - 0.5) * magnetsStrength,
        duration: 0.5,
        ease: 'Power2.easeOut',
      });

      gsap.to(magnetText, {
        x: (((event.clientX - bounding.left) / magnetButton.offsetWidth) - 0.5) * magnetsStrength,
        y: (((event.clientY - bounding.top) / magnetButton.offsetHeight) - 0.5) * magnetsStrength,
        duration: 0.5,
        ease: 'Power2.easeOut',
      });
    }

    // Animacje postępu przewijania
    gsap.to(".scrollprogress", {
      height: "100vh",
      ease: 'none',
      scrollTrigger: {
        trigger: ".scrollContainer",
        start: "top 0%",
        end: "bottom 99%",
        scrub: true,
      },
    });
  }

  // Filtrowanie projektów
  function filter() {
    var projects = document.querySelectorAll('.project');
    var startHeight = gsap.getProperty(".projects-inner", "height");
    var state = Flip.getState('.project, .empty');
    var filters = document.querySelectorAll('.option.is_active');
  
    if(filters.length) {
      projects.forEach(function(project) {
        gsap.set(project, { display: 'block' });
        project.classList.remove('filtered');
      });
      filters.forEach(function(filter) {
        var type = filter.dataset.filter.split(':')[0];
        var value = filter.dataset.filter.split(':')[1];
        projects.forEach(function(project) {
          if(project.getAttribute('data-' + type) != value) {
            gsap.set(project, { display: 'none' });
            project.classList.add('filtered');
          }
        });
      });
    }
    else {
      projects.forEach(function(project) {
        gsap.set(project, { display: 'block' });
        project.classList.remove('filtered');
      });
    }
  
    if(document.querySelectorAll('.project:not(.filtered)').length) {
      gsap.set('.empty', { display: 'none' });
    }
    else {
      gsap.set('.empty', { display: 'block' });
    }
    
    var endHeight = gsap.getProperty(".projects-inner", "height");
  
    var flip = Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.08,
      absolute: true,
      onEnter: elements => gsap.fromTo(elements, {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: .6}),
      onLeave: elements => gsap.fromTo(elements, {opacity: 1, scale: 1}, {opacity: 0, scale: 0, duration: .6})
    })
    flip.fromTo(".projects-inner", {
      height: startHeight
    }, {
      height: endHeight,
      clearProps: "height",
      duration: flip.duration()
    }, 0);

      // Scroll to ".portfolio" after filtering
      var portfolioElement = document.querySelector('.portfolio');
      if (portfolioElement) {
      portfolioElement.scrollIntoView({ behavior: 'smooth' });
      }
  
  }
  
  document.querySelectorAll('.filter-buttons').forEach(function(button) {
    button.querySelectorAll('.option').forEach(function(option) {
      option.addEventListener('click', function(event) {
        is_active = false;
        ScrollTrigger.refresh();
        button.querySelectorAll('.option').forEach(function(option2) {
          if(option2.classList.contains('is_active')) {
            option2.classList.remove('is_active');
            if(option2 == option) {
              is_active = true;
            }
          }
        });
        if(!is_active) {
          event.currentTarget.classList.add('is_active');
        }
        filter();
        event.preventDefault();
      });
    });
  });



  // Menu pełnoekranowe
  const menuToggle = document.getElementById("menuToggle");
  const menuBar = gsap.timeline();
  const tl = gsap.timeline({ paused: true });

  tl.to('.fullpage-menu', { duration: 0, display: "block", ease: 'Expo.easeInOut' })
    .from('.menu-bg', { duration: 0.8, opacity: 0, ease: 'Expo.easeInOut' })
    .from('.main-menu li a', { duration: 1.3, y: "110%", stagger: 0.1, ease: 'Expo.easeInOut' }, "-=0.6")
    .from('.line-xh', { duration: 1, stagger: 0.1, width: "0", ease: 'Expo.easeInOut' }, "-=1.3")
    .reverse();

  menuToggle.addEventListener('click', () => {
    tl.reversed(!tl.reversed());
    menuBar.reversed(!menuBar.reversed());
    document.querySelector("body").classList.toggle("menu-open");
  });

  // Animacja ikony wysyłania
  if (document.querySelector('.send-icon-big')) {
    gsap.from('.send-icon-big', {
      yPercent: 120,
      xPercent: -100,
      duration: 0.75,
      delay: 0.35,
    });
  }
}

// Dodawanie i usuwanie klasy menu
function addMenuClass() {
  const MenuClass = document.querySelector("body");
  const MenuToggle = document.querySelector(".menu-toggle");
  MenuToggle.addEventListener('click', () => MenuClass.classList.toggle("menu-open"));
}
addMenuClass();

function removeMenuClass() {
  document.querySelector("body").classList.remove("menu-open");
}