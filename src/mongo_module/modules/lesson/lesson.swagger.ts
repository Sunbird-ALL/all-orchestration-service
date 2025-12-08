/**
 * @swagger
 * /lesson/addLesson:
 *   post:
 *     summary: Add lesson progress for a user
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sessionId: "session_12345"
 *             language: "en"
 *             milestone: "m1"
 *             milestoneLevel: "level_1"
 *             lesson: "lesson_1"
 *             progress: 75
 *     responses:
 *       200:
 *         description: Lesson added successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /lesson/getLessonProgressByUserId:
 *   get:
 *     summary: Get lesson progress by user ID
 *     tags: [Lesson]
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
 *         description: Lesson progress retrieved successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 */

