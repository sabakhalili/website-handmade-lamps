(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    wireWhatsAppLinks();
    wireInstagramLinks();
    wireNavToggle();
    wireCategoryFilter();
    wireGallery();
  });

  function wireWhatsAppLinks() {
    var links = document.querySelectorAll("[data-whatsapp-link]");
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      el.href = buildWhatsAppLink(el.getAttribute("data-product") || undefined);
      el.target = "_blank";
      el.rel = "noopener";
    }
  }

  function wireInstagramLinks() {
    var links = document.querySelectorAll("[data-instagram-link]");
    for (var i = 0; i < links.length; i++) {
      links[i].href = window.SITE_CONFIG.instagramUrl;
      links[i].target = "_blank";
      links[i].rel = "noopener";
    }
  }

  function wireNavToggle() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("nav__menu--open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function wireGallery() {
    var mainImage = document.querySelector(".product-detail__main-image");
    var thumbs = document.querySelectorAll(".product-detail__thumb-btn");
    if (!mainImage || !thumbs.length) return;

    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].addEventListener("click", function (e) {
        var btn = e.currentTarget;
        mainImage.src = btn.getAttribute("data-full");
        mainImage.alt = btn.getAttribute("data-alt");
      });
    }
  }

  function wireCategoryFilter() {
    var pills = document.querySelectorAll("[data-category-pill]");
    var cards = document.querySelectorAll("[data-product-category]");
    if (!pills.length || !cards.length) return;

    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener("click", function (e) {
        var selected = e.currentTarget.getAttribute("data-category-pill");

        for (var p = 0; p < pills.length; p++) {
          pills[p].classList.remove("pill--active");
          pills[p].setAttribute("aria-pressed", "false");
        }
        e.currentTarget.classList.add("pill--active");
        e.currentTarget.setAttribute("aria-pressed", "true");

        for (var c = 0; c < cards.length; c++) {
          var cardCategory = cards[c].getAttribute("data-product-category");
          var show = selected === "All" || selected === cardCategory;
          cards[c].hidden = !show;
        }
      });
    }
  }
})();
