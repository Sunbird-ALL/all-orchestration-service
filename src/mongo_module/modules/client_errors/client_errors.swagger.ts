/**
 * @swagger
 * /client-errors/:
 *   post:
 *     summary: Record a client-side error for logging and analytics
 *     tags: [Client Errors]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *           example:
 *             type: "js_error"
 *             message: "Cannot read property 'x' of undefined"
 *             url: "https://app.example.com/lesson"
 *             ts: 1713000000000
 *     responses:
 *       201:
 *         description: Error payload accepted
 *       400:
 *         description: Request failed (e.g. persistence error)
 */
