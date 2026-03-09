const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number(),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"])
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string())
    })
  )
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
You are a senior software engineering interviewer.

Analyze the candidate profile and generate an interview preparation report.

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Rules:
- Generate 5 technical questions
- Generate 3 behavioral questions
- Identify skill gaps
- Create a 5 day preparation plan
-Also generate a matchScore between 0 and 100 indicating how well the candidate profile matches the job description.
-Extract the job title from the job description and return it as "targetRole".
Return strictly valid JSON following the provided schema.
`

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema)
    }
  })

  const text = response.text

  console.log("AI RESPONSE:", text)

  return JSON.parse(text)
}

async function generatePdfFromHtml(htmlContent) {

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  })

  const page = await browser.newPage()

  await page.setContent(htmlContent, { waitUntil: "networkidle0" })

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true
  })

  await browser.close()

  return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  const resumePdfSchema = z.object({
    html: z.string()
  })

  const prompt = `
Generate a professional resume using the following information.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return JSON:
{
 "html": "<valid resume html>"
}
`

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema)
    }
  })

  const jsonContent = JSON.parse(response.text)

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

  return pdfBuffer
}

module.exports = {
  generateInterviewReport,
  generateResumePdf
}