function appMain() {
  
	// Pobieramy aktualny adres URL
	var currentUrl = window.location.pathname;
	var menuLinks = document.querySelectorAll('.menu a');
	menuLinks.forEach(function(link) {
		link.classList.remove('link-active');
	});
	menuLinks.forEach(function(link) {
		if (link.getAttribute('href') === currentUrl) {
			link.classList.add('link-active');
		}
	});  

  // Lazy blur images
  if (document.querySelector(".blur-load")) {
		const lazyImages = document.querySelectorAll('img[loading="lazy"]');
	
		if (lazyImages.length > 0) {
			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const img = entry.target;
	
						function loaded() {
							img.classList.add("loaded");
						}
	
						if (img.complete) {
							loaded();
						} else {
							img.addEventListener("load", loaded);
						}
	
						observer.unobserve(img); // Przestań obserwować po załadowaniu
					}
				});
			}, {
				root: null, // Obserwujemy widoczność w oknie przeglądarki
				rootMargin: "300px" // Załaduj obraz 300px przed krawędzią ekranu
			});
	
			lazyImages.forEach(img => observer.observe(img));
		}
	
};



	if (document.querySelector('.swiper-opinion')) {
		var swiper = new Swiper(".swiper-opinion", {
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 15,
			lazyPreloadPrevNext: 1,
			centeredSlides: false,
			loop: true,
			pagination: {
				el: ".swiper-pagination",
				clickable: true
			},
			scrollbar: {
				el: '.swiper-scrollbar',
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			autoplay: {
				delay: 5000,
			},
			keyboard: {
				enabled: true
			},
			mousewheel: false,
			breakpoints: {
				460: {
					slidesPerView: 1.25
				},
				768: {
					slidesPerView: 1.8
				},
				991: {
					slidesPerView: 2
				},
				1024: {
					slidesPerView: 2
				},
				1200: {
					slidesPerView: 2
				}
			}
		});
	};

	if (document.querySelector('.swiper-works')) {
		var swiper = new Swiper(".swiper-works", {
			grabCursor: true,
			slidesPerView: 1,
			spaceBetween: 15,
			centeredSlides: false,
			loop: true,
			lazy: {
				loadPrevNext: true, // pre-loads the next image to avoid showing a loading placeholder if possible
				loadPrevNextAmount: 2 //or, if you wish, preload the next 2 images
			},
			pagination: {
				el: ".swiper-pagination",
				clickable: true
			},
			scrollbar: {
				el: '.swiper-scrollbar',
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			autoplay: {
				delay: 4000,
			},
			keyboard: {
				enabled: true
			},
			mousewheel: false,
		});
	};

/*
	if (document.querySelector('.works-grid-item')) {
		var worksGridItems = document.querySelectorAll('.works-grid-item');
		worksGridItems.forEach(function(item) {
			item.addEventListener('mouseenter', function(event) {
				worksGridItems.forEach(function(innerItem) {
					if (innerItem !== item) {
						innerItem.classList.add('works-grid-item-effect');
					}
				});
			});
			item.addEventListener('mouseleave', function(event) {
				worksGridItems.forEach(function(innerItem) {
					if (innerItem !== item) {
						innerItem.classList.remove('works-grid-item-effect');
					}
				});
			});
		});
	}
*/

	// Greeting
	if (document.querySelector("#greeting")) {
		const greeting = document.getElementById("greeting");
		const hour = new Date().getHours();
		const welcomeTypes = ["Dzień dobry", "Dobry wieczór"];
		let welcomeText = "";
		if (hour < 20) welcomeText = welcomeTypes[0];
		else welcomeText = welcomeTypes[1];
		greeting.innerHTML = welcomeText;
	}
  // Header scrolled
	(function() {
		var doc = document.documentElement;
		var w = window;
		var curScroll;
		var prevScroll = w.scrollY || doc.scrollTop;
		var curDirection = 0;
		var prevDirection = 0;
		var body = document.querySelector('body');
		var header = document.querySelector('.site-header');
		var toggled;
		var threshold = 20;

		var checkScroll = function() {
			curScroll = w.scrollY || doc.scrollTop;
			if (curScroll > prevScroll) {
				// scrolled down
				curDirection = 2;
			} else {
				// scrolled up
				curDirection = 1;
			}

			if (curDirection !== prevDirection) {
				toggled = toggleHeader();
			}

			// Add or remove 'scrolled' class based on scroll position
			if (curScroll > 150) {
				header.classList.add('scrolled');
			} else {
				header.classList.remove('scrolled');
			}

			prevScroll = curScroll;
			if (toggled) {
				prevDirection = curDirection;
			}
		};

		var toggleHeader = function() {
			toggled = true;
			if (curDirection === 2 && curScroll > threshold) {
				header.classList.add('hide');
				body.classList.add('sticky-up');
        body.classList.remove('sticky-down');
			} else if (curDirection === 1) {
				header.classList.remove('hide');
				body.classList.remove('sticky-up');
        body.classList.add('sticky-down');
			} else {
				toggled = false;
			}
			return toggled;
		};

		window.addEventListener('scroll', checkScroll);

	})();

	// Acordion
	if (document.querySelector(".accordion")) {
		const accordions = document.querySelectorAll(".accordion");

		if (accordions.length > 0) {
			accordions.forEach((accordion, index) => {
				accordion.addEventListener("click", function () {
					const content = this.nextElementSibling;
	
					if (content.style.maxHeight) {
						content.style.maxHeight = null;
						this.classList.remove("open");
					} else {
						accordions.forEach(acc => {
							acc.classList.remove("open");
							acc.nextElementSibling.style.maxHeight = null;
						});
	
						content.style.maxHeight = content.scrollHeight + "px";
						this.classList.add("open");
					}
				});
	
				// Otwórz pierwszy akordeon domyślnie
				if (index === 0) {
					accordion.classList.add("open");
					accordion.nextElementSibling.style.maxHeight = accordion.nextElementSibling.scrollHeight + "px";
				}
			});
		}
	};


	if (document.querySelector('.form-outer')) {
		initMultiStepForm();

		function initMultiStepForm() {
			const progressNumber = document.querySelectorAll(".step").length;
			const slidePage = document.querySelector(".slide-page");
			const progressCheck = document.querySelectorAll(".step .check");
			const bullet = document.querySelectorAll(".step .bullet");
			const pages = document.querySelectorAll(".page");
			const nextButtons = document.querySelectorAll(".next");
			const prevButtons = document.querySelectorAll(".prev");
			const stepsNumber = pages.length;

			if (progressNumber !== stepsNumber) {
				console.warn(
					"Error, number of steps in progress bar do not match number of pages"
				);
			}

			document.documentElement.style.setProperty("--stepNumber", stepsNumber);

			let current = 1;

			for (let i = 0; i < nextButtons.length; i++) {
				nextButtons[i].addEventListener("click", function(event) {
					event.preventDefault();

					inputsValid = validateInputs(this);
					// inputsValid = true;

					if (inputsValid) {
						slidePage.style.marginLeft = `-${
                      (100 / stepsNumber) * current
                  }%`;
						bullet[current - 1].classList.add("active");
						progressCheck[current - 1].classList.add("active");
						current += 1;
					}
				});
			}

			for (let i = 0; i < prevButtons.length; i++) {
				prevButtons[i].addEventListener("click", function(event) {
					event.preventDefault();
					slidePage.style.marginLeft = `-${
                  (100 / stepsNumber) * (current - 2)
              }%`;
					bullet[current - 2].classList.remove("active");
					progressCheck[current - 2].classList.remove("active");
					current -= 1;
				});
			}

			function validateInputs(ths) {
				let inputsValid = true;

				const inputs =
					ths.parentElement.parentElement.querySelectorAll("input");
				for (let i = 0; i < inputs.length; i++) {
					const valid = inputs[i].checkValidity();
					if (!valid) {
						inputsValid = false;
						inputs[i].classList.add("invalid-input");
					} else {
						inputs[i].classList.remove("invalid-input");
					}
				}
				return inputsValid;
			}
		}

	}


	function handleSubmit(formId, redirectUrl) {
		var form = document.getElementById(formId);

		if (form) {
			form.addEventListener('submit', function(e) {
				e.preventDefault();

				var formData = new FormData(form);
				var xhr = new XMLHttpRequest();

				xhr.open('POST', 'https://www.futurewebstudio.pl/form/forms/' + formId + '.php');

				xhr.onreadystatechange = function() {
					if (xhr.readyState === XMLHttpRequest.DONE) {
						if (xhr.status === 200) {
							var res = JSON.parse(xhr.responseText);
							if (res.status === 1) {
								form.reset();
								window.location.href = redirectUrl; // Przekieruj po pomyślnym wysłaniu formularza
							}
						}
					}
				};

				xhr.send(formData);
			});
		}
	}
	handleSubmit('briefForm', '/wyslano-formularz');
	handleSubmit('contactForm', '/wyslano-formularz');


	const modals = document.querySelectorAll("[data-modal]");
	modals.forEach(function(trigger) {
		trigger.addEventListener("click", function(event) {
			event.preventDefault();
			const modal = document.getElementById(trigger.dataset.modal);
			const video = modal.querySelector("#modalVideo");

			modal.classList.add("open");

			const exits = modal.querySelectorAll(".modal-exit");
			exits.forEach(function(exit) {
				exit.addEventListener("click", function(event) {
					event.preventDefault();
					modal.classList.remove("open");
					video.pause();
				});
			});
			video.play();
		});
	});

// End
};