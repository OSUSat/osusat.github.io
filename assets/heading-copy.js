// Heading Copy Link Feature for OSUSat Wiki
// Adds a copy link button next to headings (h1-h6) linking directly to #section
(function () {
    "use strict";

    function injectStyles() {
        if (document.getElementById("heading-copy-styles")) return;
        var style = document.createElement("style");
        style.id = "heading-copy-styles";
        style.textContent = `
            .heading-copy-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                vertical-align: middle;
                padding: 0.25rem;
                margin-left: 0.4rem;
                border-radius: 0.375rem;
                color: #64748b;
                transition: all 0.15s ease-in-out;
                text-decoration: none !important;
                line-height: 1;
            }
            .heading-copy-btn:hover {
                color: #38bdf8;
                background-color: rgba(56, 189, 248, 0.12);
            }
            [data-theme="nord"] .heading-copy-btn {
                color: #94a3b8;
            }
            [data-theme="nord"] .heading-copy-btn:hover {
                color: #0284c7;
                background-color: rgba(2, 132, 199, 0.12);
            }

            section[id],
            h1[id], h2[id], h3[id], h4[id], h5[id], h6[id] {
                scroll-margin-top: 5.5rem;
            }

            #copy-toast-container {
                position: fixed;
                bottom: 1.5rem;
                right: 1.5rem;
                z-index: 9999;
                pointer-events: none;
            }

            .copy-toast {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                background: #0d1322;
                border: 1px solid #1e293b;
                color: #f1f5f9;
                padding: 0.65rem 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
                font-family: "JetBrains Mono", ui-monospace, monospace;
                font-size: 0.75rem;
                backdrop-filter: blur(8px);
                opacity: 0;
                transform: translateY(10px) scale(0.95);
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: auto;
            }
            .copy-toast.show {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            [data-theme="nord"] .copy-toast {
                background: #ffffff;
                border-color: #cbd5e1;
                color: #0f172a;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: fadeIn 0.15s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }

    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/^section\s+\d+:\s*/i, "") // Strip "Section X: " prefix
            .replace(/[\s\_]+/g, "-")          // Replace spaces/underscores with hyphens
            .replace(/[^\w\-]+/g, "")          // Remove non-alphanumeric chars
            .replace(/\-\-+/g, "-")            // Replace multiple hyphens with single hyphen
            .replace(/^-+/, "")                // Trim leading hyphens
            .replace(/-+$/, "");               // Trim trailing hyphens
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    }

    function showToast(message, anchorId) {
        var container = document.getElementById("copy-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "copy-toast-container";
            document.body.appendChild(container);
        }

        container.innerHTML = "";

        var toast = document.createElement("div");
        toast.className = "copy-toast";
        toast.innerHTML =
            '<svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>' +
            '</svg>' +
            '<span>' + message + ' <code class="text-sky-400 font-mono">#' + anchorId + '</code></span>';

        container.appendChild(toast);

        setTimeout(function () {
            toast.classList.add("show");
        }, 10);

        setTimeout(function () {
            toast.classList.remove("show");
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2200);
    }

    function initHeadingCopy() {
        injectStyles();

        var usedIds = new Set();
        var allWithId = document.querySelectorAll("[id]");
        allWithId.forEach(function (el) {
            if (el.id) usedIds.add(el.id);
        });

        var headings = document.querySelectorAll(
            "main h1, main h2, main h3, main h4, main h5, main h6, body > section h1, body > section h2, body > section h3, body > section h4"
        );

        headings.forEach(function (heading) {
            if (
                heading.closest("header") ||
                heading.closest("nav") ||
                heading.closest("footer") ||
                heading.closest("a") ||
                heading.hasAttribute("data-no-anchor")
            ) {
                return;
            }

            var anchorId = heading.id;

            if (!anchorId) {
                var parentSection = heading.closest("section[id]");
                if (parentSection && parentSection.id) {
                    var firstHeadingInSection = parentSection.querySelector("h1, h2, h3, h4");
                    if (firstHeadingInSection === heading) {
                        anchorId = parentSection.id;
                    }
                }
            }

            if (!anchorId) {
                var cleanText = heading.textContent.trim();
                var baseSlug = slugify(cleanText) || "heading";
                anchorId = baseSlug;
                var count = 1;
                while (usedIds.has(anchorId)) {
                    anchorId = baseSlug + "-" + count;
                    count++;
                }
                heading.id = anchorId;
                usedIds.add(anchorId);
            } else {
                usedIds.add(anchorId);
                if (!heading.id) {
                    heading.id = anchorId;
                }
            }

            heading.classList.add("group/heading");

            if (heading.querySelector(".heading-copy-btn")) {
                return;
            }

            var copyBtn = document.createElement("a");
            copyBtn.className =
                "heading-copy-btn opacity-40 sm:opacity-0 group-hover/heading:opacity-100 focus:opacity-100 transition-all duration-150";
            copyBtn.href = "#" + anchorId;
            copyBtn.setAttribute("aria-label", "Copy link to heading");
            copyBtn.setAttribute("title", "Copy link to section #" + anchorId);

            var linkIconSvg =
                '<svg class="w-4 h-4 heading-icon stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>' +
                '</svg>';

            var checkIconSvg =
                '<svg class="w-4 h-4 text-emerald-400 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>' +
                '</svg>';

            copyBtn.innerHTML = linkIconSvg;

            copyBtn.addEventListener("click", function (e) {
                e.preventDefault();
                var targetHash = "#" + anchorId;
                var fullUrl = window.location.href.split("#")[0] + targetHash;

                copyToClipboard(fullUrl)
                    .then(function () {
                        if (window.history && window.history.pushState) {
                            window.history.pushState(null, null, targetHash);
                        } else {
                            window.location.hash = targetHash;
                        }

                        copyBtn.innerHTML = checkIconSvg;
                        copyBtn.classList.add("text-emerald-400");

                        var badge = document.createElement("span");
                        badge.className =
                            "copy-badge text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded shadow ml-1 animate-fade-in";
                        badge.textContent = "Copied!";
                        copyBtn.parentNode.insertBefore(badge, copyBtn.nextSibling);

                        showToast("Link copied to clipboard:", anchorId);

                        setTimeout(function () {
                            copyBtn.innerHTML = linkIconSvg;
                            copyBtn.classList.remove("text-emerald-400");
                            if (badge.parentNode) {
                                badge.parentNode.removeChild(badge);
                            }
                        }, 1800);
                    })
                    .catch(function (err) {
                        console.error("Failed to copy link: ", err);
                    });
            });

            heading.appendChild(copyBtn);
        });

        if (window.location.hash) {
            var hashId = window.location.hash.substring(1);
            var targetEl = document.getElementById(hashId);
            if (targetEl) {
                setTimeout(function () {
                    targetEl.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeadingCopy);
    } else {
        initHeadingCopy();
    }
})();
