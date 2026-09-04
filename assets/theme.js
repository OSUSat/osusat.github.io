// Shared theme toggle: persists the daisyUI theme choice across page loads.
// Default theme is DARK ("dim") for a professional, high-contrast engineering doc look.
(function () {
  var STORAGE_KEY = "osusat-wiki-theme";
  var DARK = "dim";
  var LIGHT = "nord";
  var saved = localStorage.getItem(STORAGE_KEY);
  
  // Default to dark theme unless user explicitly chose light
  var currentTheme = (saved === LIGHT || saved === "light") ? LIGHT : DARK;
  document.documentElement.setAttribute("data-theme", currentTheme);

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    
    toggle.checked = (currentTheme === DARK);
    
    toggle.addEventListener("change", function () {
      var theme = toggle.checked ? DARK : LIGHT;
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  });
})();
