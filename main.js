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

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received from content script:", message);
    if (message.type === "accessibilityScanResults") {

        let results = message.issues
        const altImageCount = document.getElementById("altImageIssueCount");
        altImageCount.innerHTML = results['missingAltText'].length;
        const lowContrastCount = document.getElementById("lowContrastCount");
        lowContrastCount.innerHTML = results['lowContrast'].length;
        // message.issues.forEach(issue => {

        //     const li = document.createElement("li");
        //     li.textContent = `${issue.type} (${issue.count} instances)`;
        //     issuesList.appendChild(li);
        // });

        // Update the summary
        document.querySelector(".summary p").innerHTML = `<strong>Issues Found:</strong> ${message.issues.length}`;
    }
});

function findIssues(){
    console.log("Finding Issues...")

}