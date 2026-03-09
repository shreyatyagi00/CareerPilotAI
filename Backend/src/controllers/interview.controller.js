const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterViewReportController(req, res) {
  try {
    const resumeContent = await (
      new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
    ).getText();

    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });

    console.log("AI RESPONSE:", interViewReportByAi);

    // 🔧 Helper function to normalize AI data
    const normalize = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map((item) => {
        if (typeof item === "string") {
          try {
            return JSON.parse(item);
          } catch {
            return { question: item, intention: "", answer: "" };
          }
        }
        return item;
      });
    };

    const technicalQuestions = normalize(interViewReportByAi.technicalQuestions);
    const behavioralQuestions = normalize(interViewReportByAi.behavioralQuestions);
    const skillGaps = normalize(interViewReportByAi.skillGaps);
    const preparationPlan = normalize(interViewReportByAi.preparationPlan);

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
      matchScore: interViewReportByAi.matchScore ?? 70,
      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationPlan,
    });

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong while generating interview report",
      error: error.message,
    });
  }
}

module.exports = { generateInterViewReportController };