/**
 * @swagger
 * /student/register:
 *   post:
 *     summary: Register students (single or bulk)
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             type: "single"
 *             username: "12345678901"
 *     responses:
 *       200:
 *         description: Student(s) registered successfully
 *       400:
 *         description: Required fields are missing or invalid
 */

/**
 * @swagger
 * /student/login:
 *   post:
 *     summary: Student login
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             username: "12345678901"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Unauthorized
 */

