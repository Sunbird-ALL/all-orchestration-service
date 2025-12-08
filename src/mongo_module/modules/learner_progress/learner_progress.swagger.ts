/**
 * @swagger
 * /learnerProgress/createLearnerProgress:
 *   post:
 *     summary: Create learner progress record
 *     tags: [Learner Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sessionId: "session_12345"
 *             subSessionId: "sub_session_001"
 *             language: "en"
 *             milestoneLevel: "level_1"
 *     responses:
 *       200:
 *         description: Learner progress created successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /learnerProgress/learnerProgressByuserId:
 *   get:
 *     summary: Get learner progress by user ID
 *     tags: [Learner Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *         example: "en"
 *     responses:
 *       200:
 *         description: Learner progress retrieved successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

