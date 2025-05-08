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
            results['missingLabels'].length +
            results['nonKeyboardAccessible'].length;

        // Calculate the score
        const maxScore = 100;
        const deductions = (
            (results['missingAltText'].length * 1) +
            (results['lowContrast'].length * 2) +
            (results['missingLabels'].length * 3) +
            (results['nonKeyboardAccessible'].length * 4)
        );
        const finalScore = Math.max(0, maxScore - (deductions > 80 ? 80 : deductions))
     
        // Assign a grade based on the score
        let grade;
        if (finalScore >= 90) grade = "A";
        else if (finalScore >= 80) grade = "B";
        else if (finalScore >= 70) grade = "C";
        else if (finalScore >= 60) grade = "D";
        else grade = "F";

        // Update the summary
        document.querySelector(".summary p").innerHTML = `
            <strong>Issues Found:</strong> ${totalIssues} <br>
            <strong>Score:</strong> ${finalScore} <br>
            <strong>Grade:</strong> ${grade}
        `;

        // Increment and update the pages scanned count
        pagesScanned += 1;
        document.querySelector(".summary p:nth-of-type(2)").innerHTML = `
            <strong>Times Scanned:</strong> ${pagesScanned} `;

        // Pass the grade and score to the PDF generator
        const endResults = {
            "totalIssues": totalIssues,
            "pagesScanned": pagesScanned,
            "issues": results,
            "score": finalScore,
            "grade": grade
        };
        const downloadButton = document.getElementById("download-report");
        downloadButton.style.display = "inline"; 
        downloadButton.addEventListener("click", () => createPDF(endResults));
    }
});