function findAccessibilityIssues() {
    const issues = {
        "missingAltText": findImagesWithoutAlt(),
        "lowContrast": findLowContrast(),
        "missingLabels": findMissingLabels(),
        "nonKeyboardAccessible": findNonKeyboardAccessibleElements()
    }; 
    return issues;
}

const issues = findAccessibilityIssues();
chrome.runtime.sendMessage({ type: "accessibilityScanResults", issues });


// Individual functions to find specific accessibility issues
function findImagesWithoutAlt() {
    const issues = []; 

    // Images without alt attributes
    const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
    if (imagesWithoutAlt.length > 0) {
        issues.push({
            count: imagesWithoutAlt.length,
            details: [...imagesWithoutAlt].map(img => img.outerHTML)
        });
    }

    return issues;
}


function findLowContrast() {
    const issues = [];
    const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, a, li, td, th, button, label");

    elements.forEach(element => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = getEffectiveBackgroundColor(element);

        if (!element.textContent.trim() || element.textContent.trim().length < 3) return;
        if (style.display === "none" || style.visibility === "hidden") return;
        if (color === "rgba(0, 0, 0, 0)" || backgroundColor === "rgba(0, 0, 0, 0)") return;

        const contrastRatio = calculateContrastRatio(color, backgroundColor);

        // WCAG standards
        const fontSize = parseFloat(style.fontSize);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && style.fontWeight >= 700);

        if ((isLargeText && contrastRatio < 3) || (!isLargeText && contrastRatio < 4.5)) {
            issues.push({
                element: element.outerHTML,
                contrastRatio: contrastRatio.toFixed(2),
                foreground: color,
                background: backgroundColor
            });
        }
    });

    return issues;
}

function getEffectiveBackgroundColor(element) {
    let bgColor = window.getComputedStyle(element).backgroundColor;
    while (bgColor === "rgba(0, 0, 0, 0)" && element.parentElement) {
        element = element.parentElement;
        bgColor = window.getComputedStyle(element).backgroundColor;
    }
    return bgColor;
}

function calculateContrastRatio(foreground, background) {
    const fgLuminance = getLuminance(parseColor(foreground));
    const bgLuminance = getLuminance(parseColor(background));

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(rgb) {
    const [r, g, b] = rgb.map(channel => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseColor(color) {
    const rgbMatch = color.match(/rgba?\((\d+), (\d+), (\d+)/);
    return rgbMatch ? rgbMatch.slice(1, 4).map(Number) : [255, 255, 255]; 
}


function findMissingLabels(){
    const issues = []; 

    // Form elements without labels
    const formElements = document.querySelectorAll("input:not([type='hidden']), select, textarea, button");
    formElements.forEach(element => {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (!label && element.tagName !== "BUTTON") {
            issues.push({
                element: element.outerHTML,
                message: "Missing label"
            });
        }
    });

    return issues;
}

function findNonKeyboardAccessibleElements() {
    const issues = [];
    const focusableSelectors = [
        "a[href]", 
        "button",
        "input:not([type='hidden'])", 
        "select", 
        "textarea", 
        "[tabindex]" 
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(","));

    elements.forEach(element => {
        const tabindex = element.getAttribute("tabindex");

        // Check if the element is focusable
        const isFocusable =
            tabindex !== null || 
            element.tagName === "A" && element.hasAttribute("href") || 
            element.tagName === "BUTTON" || 
            element.tagName === "INPUT" && element.type !== "hidden" || 
            element.tagName === "SELECT" || 
            element.tagName === "TEXTAREA"; 

        if (!isFocusable || tabindex === "-1") {
            issues.push({
                element: element.outerHTML,
                message: "Element is not keyboard accessible"
            });
        }
    });
    return issues;
}

