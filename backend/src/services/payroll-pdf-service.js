import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

class PayrollPDFService {

  static async generatePDF(payroll, employee) {

    const folderPath = path.join("public", "payroll");

    // ⭐ Create folder if missing
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filename = `payroll_${employee.employee_id}_${payroll.month}.pdf`;
    const filepath = path.join(folderPath, filename);

    const doc = new PDFDocument();
    
    // ⭐ Wrap writeStream in try-catch to avoid crash
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // --------------- HEADER ---------------
    doc.fontSize(20).text("Company Name", { align: "center" });
    doc.fontSize(14).text("PAYROLL STATEMENT", { align: "center" });
    doc.moveDown();

    // --------------- EMPLOYEE INFO ---------------
    doc.fontSize(12).text(`Employee Name: ${employee.name}`);
    doc.text(`Employee ID: ${employee.employee_id}`);
    doc.text(`Department : ${employee.department_name}`);
    doc.text(`Month      : ${payroll.month}`);
    doc.moveDown();

    // --------------- ATTENDANCE SUMMARY ---------------
    doc.fontSize(14).text("Attendance Summary", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Working Days : ${payroll.total_working_days}`);
    doc.text(`Present      : ${payroll.total_present}`);
    doc.text(`Absent       : ${payroll.total_absent}`);
    doc.text(`Worked Hours : ${payroll.total_hours} hrs`);
    doc.text(`Overtime     : ${payroll.overtime_hours} hrs`);
    doc.moveDown();

    // --------------- SALARY BREAKDOWN ---------------
    doc.fontSize(14).text("Salary Breakdown", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Basic Salary : Rs ${payroll.basic_salary}`);
    doc.text(`Overtime Pay : Rs ${payroll.overtime_pay}`);
    doc.text(`Deductions   : Rs ${payroll.deductions ?? 0}`);
    doc.moveDown();

    doc.fontSize(14).text(`NET SALARY : Rs ${payroll.net_salary}`, {
      underline: true
    });

    doc.moveDown(2);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.text(`HR Signature: ________________________`);

    doc.end();

    return filename;
  }
}

export default PayrollPDFService;
