import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import {
  exportAttendanceData,
  getAttendanceStatistics,
  getDetailedStatistics,
} from "./database";
import { getStoredUnit } from "./unit";

export async function generateAttendancePDF(
  startDate?: string,
  endDate?: string,
) {
  try {
    // Get attendance data
    const records = await exportAttendanceData(startDate, endDate);
    const stats = await getAttendanceStatistics();
    const detailedStats = await getDetailedStatistics();
    const unitInfo = await getStoredUnit();

    if (records.length === 0) {
      throw new Error("No attendance records found");
    }

    // Get date range for title
    const reportDate =
      startDate && endDate
        ? `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        : "All Time";

    // Count by hour for hourly distribution chart
    const hourlyData = detailedStats.hourlyData || [];
    const hourLabels = Array.from({ length: 24 }, (_, i) => i);
    const hourCounts = hourLabels.map((hour) => {
      const found = hourlyData.find((h) => h.hour === hour);
      return found ? found.count : 0;
    });

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Helvetica', 'Arial', sans-serif; 
              margin: 40px; 
              font-size: 12px;
              line-height: 1.5;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            h1 { 
              color: #000; 
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 10px 0;
            }
            h2 { 
              color: #000; 
              font-size: 18px;
              font-weight: bold;
              margin: 25px 0 15px 0;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            h3 { 
              color: #000; 
              font-size: 14px;
              font-weight: bold;
              margin: 15px 0 10px 0;
            }
            .report-info {
              background-color: #fff;
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #333;
              min-width: 150px;
            }
            .info-value {
              color: #666;
            }
            .summary-box {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
            }
            .summary-item {
              flex: 1;
              text-align: center;
              padding: 15px;
              border: 1px solid #ddd;
              margin: 0 5px;
              border-radius: 4px;
            }
            .summary-number {
              font-size: 28px;
              font-weight: bold;
              color: #000;
              margin: 10px 0;
            }
            .summary-label {
              color: #666;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0 30px 0;
              font-size: 11px;
            }
            th {
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              color: #000;
            }
            td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              vertical-align: top;
            }
            .serial-cell {
              text-align: center;
              font-weight: bold;
              width: 30px;
            }
            .status-eligible {
              color: #2E7D32;
              font-weight: bold;
            }
            .status-ineligible {
              color: #D32F2F;
              font-weight: bold;
            }
            .method-cell {
              text-align: center;
            }
            .statistics-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .stat-box {
              flex: 1;
              border: 1px solid #ddd;
              padding: 15px;
              margin: 0 5px;
              border-radius: 4px;
            }
            .stat-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .stat-item {
              margin-bottom: 8px;
            }
            .hourly-chart {
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .chart-bar {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .hour-label {
              width: 40px;
              font-weight: bold;
            }
            .bar-container {
              flex: 1;
              height: 20px;
              background-color: #f0f0f0;
              margin: 0 10px;
              border-radius: 2px;
              overflow: hidden;
            }
            .bar-fill {
              height: 100%;
              background-color: #1976D2;
            }
            .bar-count {
              width: 40px;
              text-align: right;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 11px;
            }
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EXAM ATTENDANCE REPORT</h1>
            ${unitInfo ? `<h2>${unitInfo.code} - ${unitInfo.name}</h2>` : ""}
          </div>

          <div class="report-info">
            <div class="info-row">
              <span class="info-label">Report Period:</span>
              <span class="info-value">${reportDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Generated:</span>
              <span class="info-value">${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Records Count:</span>
              <span class="info-value">${records.length} students</span>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">
              <div class="summary-number">${stats.totalStudents}</div>
              <div class="summary-label">TOTAL STUDENTS</div>
            </div>
            <div class="summary-item">
              <div class="summary-number" style="color: #2E7D32;">${stats.eligibleStudents}</div>
              <div class="summary-label">ELIGIBLE</div>
            </div>
            <div class="summary-item">
              <div class="summary-number" style="color: #D32F2F;">${stats.ineligibleStudents}</div>
              <div class="summary-label">INELIGIBLE</div>
            </div>
            <div class="summary-item">
              <div class="summary-number" style="color: #ED6C02;">${stats.todaysCount}</div>
              <div class="summary-label">TODAY'S COUNT</div>
            </div>
          </div>

          <h2>Attendance Records</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>Academic Year</th>
                <th>Scanned At</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map(
                  (record, index) => `
                <tr>
                  <td class="serial-cell">${index + 1}</td>
                  <td><strong>${record.studentId}</strong></td>
                  <td>${record.fullName}</td>
                  <td class="${record.status === "eligible" ? "status-eligible" : "status-ineligible"}">
                    ${record.status === "eligible" ? "ELIGIBLE" : "NOT ELIGIBLE"}
                  </td>
                  <td>${record.academicYear}</td>
                  <td>${new Date(record.timestamp).toLocaleString()}</td>
                  <td class="method-cell">
                    ${record.verificationMethod === "exam_card" ? "BARCODE" : "MANUAL"}
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="page-break"></div>

          <h2>Detailed Statistics</h2>
          
          <div class="statistics-section">
            <div class="stat-box">
              <div class="stat-title">Verification Methods</div>
              ${(detailedStats.byMethod || [])
                .map(
                  (method) => `
                <div class="stat-item">
                  ${method.verificationMethod === "exam_card" ? "Barcode Scan" : "Manual Entry"}: 
                  <strong>${method.count}</strong>
                </div>
              `,
                )
                .join("")}
            </div>
            
            <div class="stat-box">
              <div class="stat-title">Status Distribution</div>
              ${(detailedStats.byStatus || [])
                .map(
                  (status) => `
                <div class="stat-item">
                  ${status.status === "eligible" ? "Eligible" : "Not Eligible"}: 
                  <strong>${status.count}</strong>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>

          <h3>Hourly Distribution</h3>
          <div class="hourly-chart">
            ${hourLabels
              .map((hour, index) => {
                const count = hourCounts[index];
                const maxCount = Math.max(...hourCounts);
                const widthPercent =
                  maxCount > 0 ? (count / maxCount) * 100 : 0;
                return `
                <div class="chart-bar">
                  <div class="hour-label">${hour.toString().padStart(2, "0")}:00</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${widthPercent}%"></div>
                  </div>
                  <div class="bar-count">${count}</div>
                </div>
              `;
              })
              .join("")}
          </div>

          <div class="footer">
            <p>Generated by Exam Attendance System</p>
            <p>Page 1 of 1 • Report ID: ${Date.now()}</p>
          </div>
        </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Download/Save the PDF instead of sharing
    try {
      const downloadsDir = FileSystem.documentDirectory + "Downloads/";
      await FileSystem.makeDirectoryAsync(downloadsDir, {
        intermediates: true,
      });

      const fileName = `Attendance_Report_${new Date().toISOString().split("T")[0]}_${Date.now()}.pdf`;
      const newPath = downloadsDir + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      Alert.alert("PDF Generated", `Report saved to: ${newPath}`, [
        {
          text: "Open PDF",
          onPress: async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(newPath, {
                mimeType: "application/pdf",
                dialogTitle: "Attendance Report",
                UTI: "com.adobe.pdf",
              });
            }
          },
        },
        { text: "OK", style: "cancel" },
      ]);

      return newPath;
    } catch (error) {
      console.error("Error saving PDF:", error);
      // Fallback to sharing if save fails
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Attendance Report PDF",
          UTI: "com.adobe.pdf",
        });
      }
    }

    return uri;
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
