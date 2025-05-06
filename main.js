import createPDF from "./pdfGenerator.js";
// Listen for button click
document.getElementById("scan-button").addEventListener("click", function () {
    console.log("Scan button clicked");

    // Trigger the content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        });
    });
    
});

// Track the number of pages scanned
let pagesScanned = 0;

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received from content script:", message);
    if (message.type === "accessibilityScanResults") {
        let results = message.issues;

        // Update individual issue counts
        const altImageCount = document.getElementById("altImageIssueCount");
        altImageCount.innerHTML = results['missingAltText'].length;

        const lowContrastCount = document.getElementById("lowContrastCount");
        lowContrastCount.innerHTML = results['lowContrast'].length;

        const missingLabelCount = document.getElementById("missingLabelsCount");
        missingLabelCount.innerHTML = results['missingLabels'].length;

        // Calculate total issues
        const totalIssues =
            results['missingAltText'].length +
            results['lowContrast'].length +
            results['missingLabels'].length;

        // Update the summary
        document.querySelector(".summary p").innerHTML = `<strong>Issues Found:</strong> ${totalIssues}`;

        // Increment and update the pages scanned count
        pagesScanned += 1;
        document.querySelector(".summary p:nth-of-type(2)").innerHTML = `<strong>Pages Scanned:</strong> ${pagesScanned}`;
        const endResults = {
            "totalIssues": totalIssues, 
            "pagesScanned": pagesScanned,
            "issues": results
        }
        createPDF(endResults)
    }
});