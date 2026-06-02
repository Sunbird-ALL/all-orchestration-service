/**
 * @swagger
 * /virtualId/generateVirtualID:
 *   post:
 *     summary: Generate a virtual ID for user
 *     tags: [Virtual ID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             username: "user123"
 *     responses:
 *       200:
 *         description: Virtual ID generated successfully
 *       400:
 *         description: Required fields are missing
 */

/**
 * @swagger
 * /virtualId/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Virtual ID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: "jwt_token_here"
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /virtualId/tokenStatus:
 *   post:
 *     summary: Check token status
 *     tags: [Virtual ID]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: "jwt_token_here"
 *     responses:
 *       200:
 *         description: Token status retrieved
 *       400:
 *         description: Invalid request
 */



