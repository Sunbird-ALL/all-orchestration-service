/**
 * @swagger
 * /baselineAssessment/addBaseline:
 *   post:
 *     summary: Add baseline assessment
 *     tags: [Baseline Assessment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             studentId: "student_001"
 *             assessmentId: "assessment_001"
 *             score: 75
 *     responses:
 *       200:
 *         description: Baseline assessment added successfully
 *       400:
 *         description: Required fields are missing
 */

/**
 * @swagger
 * /baselineAssessment/getAssessmet/{studentId}/{assessmentId}:
 *   get:
 *     summary: Get baseline assessment by student ID and assessment ID
 *     tags: [Baseline Assessment]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "student_001"
 *       - in: path
 *         name: assessmentId
 *         required: false
 *         schema:
 *           type: string
 *         example: "assessment_001"
 *     responses:
 *       200:
 *         description: Baseline assessment retrieved successfully
 *       400:
 *         description: Invalid request
 */

