const express = require("express")
const interviewController = require("../controllers/interview.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)


module.exports = interviewRouter