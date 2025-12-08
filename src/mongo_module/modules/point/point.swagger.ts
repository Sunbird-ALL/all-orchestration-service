/**
 * @swagger
 * /pointer/addPoints:
 *   post:
 *     summary: Add points for a user
 *     tags: [Pointer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sessionId: "session_12345"
 *             language: "en"
 *             milestone: "level_1_complete"
 *             points: 50
 *     responses:
 *       200:
 *         description: Point added successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /pointer/getPoints/{sessionId}:
 *   get:
 *     summary: Get points by user and session
 *     tags: [Pointer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "session_12345"
 *       - in: query
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *         example: "en"
 *     responses:
 *       200:
 *         description: Points retrieved successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

