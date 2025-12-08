/**
 * @swagger
 * /adaptiveLearning/addSchoolUdise:
 *   post:
 *     summary: Add school UDISE code
 *     tags: [Adaptive Learning]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             udise_code: "12345678901"
 *             school_name: "ABC School"
 *     responses:
 *       200:
 *         description: School UDISE added successfully
 *       400:
 *         description: Required fields are missing
 */

/**
 * @swagger
 * /adaptiveLearning/validateUdise/{udise_code}:
 *   get:
 *     summary: Validate UDISE code
 *     tags: [Adaptive Learning]
 *     parameters:
 *       - in: path
 *         name: udise_code
 *         required: true
 *         schema:
 *           type: string
 *         example: "12345678901"
 *     responses:
 *       200:
 *         description: UDISE validation result
 *       400:
 *         description: Invalid UDISE code
 */

/**
 * @swagger
 * /adaptiveLearning/deleteByUdise/{udise_code}:
 *   delete:
 *     summary: Delete school by UDISE code
 *     tags: [Adaptive Learning]
 *     parameters:
 *       - in: path
 *         name: udise_code
 *         required: true
 *         schema:
 *           type: string
 *         example: "12345678901"
 *     responses:
 *       200:
 *         description: School deleted successfully
 *       400:
 *         description: Invalid UDISE code
 */

/**
 * @swagger
 * /adaptiveLearning/getAllUdise:
 *   get:
 *     summary: Get all UDISE codes
 *     tags: [Adaptive Learning]
 *     responses:
 *       200:
 *         description: All UDISE codes retrieved successfully
 *       400:
 *         description: Something went wrong
 */

