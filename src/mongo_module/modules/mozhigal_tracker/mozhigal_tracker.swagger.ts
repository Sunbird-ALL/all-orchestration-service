/**
 * @swagger
 * /tracker/{lessonId}:
 *   post:
 *     summary: Add learning logs for a lesson
 *     tags: [Mozhigal Tracker]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         example: "lesson_001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             score: 85
 *     responses:
 *       200:
 *         description: Learning logs added successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /tracker/student:
 *   get:
 *     summary: Get cumulative score for student
 *     tags: [Mozhigal Tracker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cumulative score retrieved successfully
 *       400:
 *         description: Something went wrong
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /tracker/lessons:
 *   get:
 *     summary: Get lesson-wise score
 *     tags: [Mozhigal Tracker]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lesson-wise score retrieved successfully
 *       400:
 *         description: Something went wrong
 *       401:
 *         description: Unauthorized
 */

