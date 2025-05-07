export default function createPDF(report) {
    console.log("Report Received:", report);
    const pdf = new window.jspdf.jsPDF();

    // Add a gradient-like header background
    pdf.setFillColor(22, 160, 133); // Teal color
    pdf.rect(0, 0, 210, 30, 'F'); // Full-width rectangle for the header

    // Title Section
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text("Accessibility Report", 105, 20, { align: "center" });

    // Subtitle
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(12);
    pdf.text("Empowering small businesses to improve web accessibility", 105, 27, { align: "center" });

    // Add a horizontal divider
    pdf.setDrawColor(169, 169, 169); // Light gray
    pdf.setLineWidth(0.5);
    pdf.line(10, 35, 200, 35);

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text("Summary", 10, 45);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Issues Found: ${report.totalIssues}`, 10, 55);
    pdf.text(`Times Scanned: ${report.pagesScanned}`, 10, 63);
    pdf.text(`Score: ${report.score}`, 10, 71);
    pdf.text(`Grade: ${report.grade}`, 10, 79);

    // Add a light gray background for the "Accessibility Issues" section
    pdf.setFillColor(240, 240, 240); // Light gray-
    pdf.rect(0, 85, 210, 10, 'F'); // Full-width rectangle for the section header

    // Accessibility Issues Section
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text("Accessibility Issues", 10, 92);

    // Issue 1: Missing Alt Text
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`1. Found ${report.issues['missingAltText'].length} images with missing alt text.`, 10, 102);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100); // Gray text
    pdf.text("Alt text helps users who rely on screen readers.", 16, 109);

    // Issue 2: Low Contrast Text
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text(`2. Found ${report.issues['lowContrast'].length} issues with low contrast text.`, 10, 119);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100); // Gray text
    pdf.text("Adequate contrast makes text readable for everyone.", 16, 126);

    // Issue 3: Missing Form Labels
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text(`3. Found ${report.issues['missingLabels'].length} forms with missing labels.`, 10, 136);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100); // Gray text
    pdf.text("Clearly labeled form controls help users complete forms easily.", 16, 143);

    // Issue 4: Non-Keyboard Accessible Elements
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text(`4. Found ${report.issues['nonKeyboardAccessible'].length} elements not accessible by keyboard.`, 10, 153);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100); // Gray text
    pdf.text("Keyboard navigation is essential for users with motor impairments.", 16, 160);


    // Score Section
    pdf.setFillColor(22, 160, 133); // Teal color
    pdf.roundedRect(10, 180, 190, 30,1.5,1.5, 'F');

    pdf.setFontSize(20);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(255, 255, 255); 
    pdf.text(`Accessbility \nScore`, 20 , 193)

    pdf.setFontSize(40);
    pdf.setFont("helvetica", 'bold');
    pdf.text(`${report.grade}`, 85, 197);

    pdf.setFontSize(16);
    pdf.setFont("helvetica", 'normal');
    pdf.setTextColor(255, 255, 255); 
    pdf.text(`Improving accessibilty helps\nall users and boosts SEO.`, 120 , 192)

    



    

    


    // Detailed Elements Section
    pdf.addPage(); // Add a new page for detailed elements
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0); // Black text
    pdf.text("Detailed Accessibility Issues", 10, 20);

    // Loop through each issue type and list the elements
    let yPosition = 30;
    for (const [issueType, elements] of Object.entries(report.issues)) {
        if (elements.length === 0) continue; // Skip if there are no issues for this type

        // Add the issue type header
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0); // Black text
        pdf.text(`${issueType.replace(/([A-Z])/g, ' $1')}:`, 10, yPosition); // Format camelCase to readable text
        yPosition += 10;

        // Add details for each element
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(50, 50, 50); // Dark gray text
        elements.forEach((element, index) => {
            if (yPosition > 280) { // Add a new page if the content exceeds the page height
                pdf.addPage();
                yPosition = 20;
            }

            // Display the element details (assuming each element is an object with meaningful properties)
            const elementDetails = Object.entries(element)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ");

            // Split the text into multiple lines if it's too long
            const lines = pdf.splitTextToSize(`${index + 1}. ${elementDetails}`, 190); // 190 is the width of the page minus margins
            lines.forEach((line) => {
                if (yPosition > 280) { // Add a new page if the content exceeds the page height
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(line, 10, yPosition);
                yPosition += 8; // Add spacing between lines
            });

            yPosition += 5; // Add spacing between elements
        });

        yPosition += 10; // Add some spacing between issue types
    }

    // Add a footer with the generation date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(169, 169, 169); // Light gray text
    pdf.text(`Report generated on: ${new Date().toLocaleDateString()}`, 10, 280);
    pdf.text("© 2025 Accessibility Tracker. Empowering small businesses.", 105, 290, { align: "center" });

    // Save the PDF
    pdf.save("Accessibility_Report.pdf");
}
