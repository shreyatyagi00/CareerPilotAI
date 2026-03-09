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

    let preparationPlan = preparationPlanRaw.map((p, index) => {

  if (typeof p === "string") {
    return {
      day: index + 1,
      focus: p,
      tasks: [p]
    }
  }

  return {
    day: p.day || index + 1,
    focus: p.focus || "",
    tasks: p.tasks || []
  }

});

if (preparationPlan.length === 0) {

  preparationPlan = [
    { day: 1, focus: "Review core concepts", tasks: ["Revise fundamentals", "Review job requirements"] },
    { day: 2, focus: "Practice technical questions", tasks: ["Solve coding problems", "Practice interview questions"] },
    { day: 3, focus: "Strengthen weak areas", tasks: ["Study missing skills", "Work on mini exercises"] },
    { day: 4, focus: "Mock interview practice", tasks: ["Practice behavioral questions", "Explain projects clearly"] },
    { day: 5, focus: "Final revision", tasks: ["Review notes", "Prepare final talking points"] }
  ]

}

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

  try {

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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=resume_${interviewReportId}.pdf`
    );

    res.status(200).send(pdfBuffer);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error generating resume pdf",
      error: error.message
    });

  }
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