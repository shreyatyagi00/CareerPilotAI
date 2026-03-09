const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterViewReportController(req, res) {
  try {

    const resumeContent = await (
      new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
    ).getText();

    const { selfDescription, jobDescription } = req.body;

    const aiReport = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });

    console.log("AI RESPONSE:", aiReport);

    // 🔹 Handle both camelCase and snake_case AI responses

    const technicalQuestionsRaw =
      aiReport.technicalQuestions || aiReport.technical_questions || [];

    const behavioralQuestionsRaw =
      aiReport.behavioralQuestions || aiReport.behavioral_questions || [];

    const skillGapsRaw =
      aiReport.skillGaps || aiReport.skill_gaps || [];

    const preparationPlanRaw =
      aiReport.preparationPlan || aiReport.preparation_plan || [];

    // 🔹 Convert AI response to Mongo schema format

    const technicalQuestions = technicalQuestionsRaw.map(q => ({
      question: q,
      intention: "Assess candidate's technical knowledge",
      answer: "Candidate should explain the concept clearly with examples"
    }));

    const behavioralQuestions = behavioralQuestionsRaw.map(q => ({
      question: q,
      intention: "Evaluate behavioral and soft skills",
      answer: "Answer using STAR method"
    }));

    const skillGaps = skillGapsRaw.map(s => ({
      skill: s,
      severity: "medium"
    }));

    const preparationPlan = preparationPlanRaw.map((p, index) => ({
      day: index + 1,
      focus: p,
      tasks: [p]
    }));

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,

      title: aiReport.targetRole || aiReport.target_role ,

      resume: resumeContent.text,

      selfDescription,

      jobDescription,

      matchScore: aiReport.matchScore ,

      technicalQuestions,

      behavioralQuestions,

      skillGaps,

      preparationPlan
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Something went wrong while generating interview report",
      error: error.message
    });

  }
}

async function getInterviewReportByIdController(req, res) {

  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found"
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully",
    interviewReport
  });
}

async function getAllInterviewReportsController(req, res) {

  try {

    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-resume -selfDescription -jobDescription -__v")

    res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message
    })

  }

}

async function generateResumePdfController(req, res) {

  const { interviewReportId } = req.params;

  const interviewReport = await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found"
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
  });

  res.send(pdfBuffer);
}

async function deleteInterviewReport(req, res) {

  try {

    const { id } = req.params

    const report = await interviewReportModel.findOneAndDelete({
      _id: id,
      user: req.user.id
    })

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      })
    }

    res.status(200).json({
      message: "Report deleted successfully"
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    })

  }

}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  deleteInterviewReport
};