/**
 * Site configuration — the file to edit for day-to-day contact-info changes.
 * Everything marked REPLACE_ME is a placeholder — swap before launch.
 */
window.SITE_CONFIG = {
  brandName: "Dock9 Studio",

  // WhatsApp number, digits only, with country code, no +/spaces/dashes.
  // TODO(real-content): REPLACE_ME with the studio's real WhatsApp number.
  whatsappNumber: "911234567890",
  whatsappDefaultMessage: "Hi, I'd like to know more about Dock9 Studio's lamps.",

  // TODO(real-content): REPLACE_ME with the real Instagram handle/URL.
  instagramHandle: "@dock9studio",
  instagramUrl: "https://instagram.com/dock9studio",

  email: "",

  tradeNote:
    "Trade and wholesale buyers welcome — message us on WhatsApp or Instagram " +
    "with your requirements and we'll get back to you with details.",

  categories: ["Wall", "Pendant", "Floor", "Table"],
};

/**
 * Builds a wa.me deep link, optionally pre-filled with a product-specific message.
 */
function buildWhatsAppLink(productName) {
  var cfg = window.SITE_CONFIG;
  var text = productName
    ? 'Hi, I\'m interested in the "' + productName + '" lamp.'
    : cfg.whatsappDefaultMessage;
  return "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(text);
}
