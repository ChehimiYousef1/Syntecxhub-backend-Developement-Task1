const express = require("express");
const AppError = require("../../utils/AppError");
const User = require("../models/Users");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */


/**
 * Create an helpper function to calculate the age of the user
*/
const calculateAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if(m < 0 || (m === 0 && today.getDay() < birth.getDay())) age--;
    return age;
};

/**
 * @swagger
 * /users/addNewUser:
 *   post:
 *     tags:
 *       - Users
 *     summary: Add a new user.
 *     description: Creates a new user with the provided fields.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Youssef
 *               middle_name:
 *                 type: string
 *                 example: Khodor
 *               last_name:
 *                 type: string
 *                 example: El-Chehimi
 *               email:
 *                 type: string
 *                 example: chehimi030@gmail.com
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 2002-11-06
 *               user_name:
 *                 type: string
 *                 description: Optional username, max 12 characters, alphanumeric
 *                 example: youssef123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64f3b3e8c0d4f2a9b1f12345
 *                     full_name:
 *                       type: string
 *                       example: "Youssef Khodor El-Chehimi"
 *                     age:
 *                       type: integer
 *                       example: 21
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: "2002-11-06"
 *                     gender:
 *                       type: string
 *                       enum: [male, female]
 *                       example: male
 *                     email:
 *                       type: string
 *                       example: "chehimi030@gmail.com"
 *                     message:
 *                       type: string
 *                       example: "Hello Users with ID 64f3b3e8c0d4f2a9b1f12345 and name Youssef Khodor El-Chehimi (age 21, DOB 2002-11-06, male, email: chehimi030@gmail.com). Thanks for registration, we will contact you soon."
 *       400:
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed for one or more fields"
 *                 errors:
 *                   type: array
 *                   description: List of field-specific errors
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "Email is required and must be a valid email address"
 */

router.post('/addNewUser',async (req, res, next) => {
    try{
         const {
            first_name,
            middle_name,
            last_name,
            email,
            gender,
            date_of_birth,
            user_name
            } = req.body;

            const user = await User.create({
                firstName:   first_name,
                middleName:  middle_name,
                lastName:    last_name,
                email,
                gender,
                dateOfBirth: date_of_birth,
                userName:    user_name
            });
        //let's define the full_name
        const full_name = `${user.firstName} ${user.middleName} ${user.lastName}`;
        const age = calculateAge(user.dateOfBirth);
            res.status(201).json({
                success: true,
                data: {
                    id: user._id,
                    full_name,
                    age,
                    date_of_birth: date_of_birth,  
                    gender: user.gender,
                    email: user.email,
                    message: `Hello Users with ID ${user._id} and name ${full_name} (age ${age}, DOB ${date_of_birth}, ${user.gender}, email: ${user.email}). Thanks for registration, we will contact you soon.`
                    //                                                                            
                }
            });
        } catch (err) {
            // Handle Validation Error
            if (err.name === 'ValidationError') {
                const errors = Object.keys(err.errors).map(field => ({
                    field,
                    message: err.errors[field].message
                }));
                return res.status(400).json({
                    success: false,
                    message: "Validation failed for one or more fields",
                    errors
                });
            }

            // 👇 Add this — Handle duplicate key error
            if (err.code === 11000) {
                const field = Object.keys(err.keyValue)[0];
                return res.status(400).json({
                    success: false,
                    message: "Validation failed for one or more fields",
                    errors: [{
                        field,
                        message: `${field} already exists`
                    }]
        });
    }

    next(err);
}  
});

/**
 * @swagger
 * /users/getAllUsersRegisteredData:
 *      get:
 *          tags:
 *            - Users
 *          summary: Get all users.
 *          description: API to get all registered users.
 *          responses:
 *              200:
 *                  description: Successfully retrieved users list
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: boolean
 *                                      example: true
 *                                  count:
 *                                      type: integer
 *                                      example: 2
 *                                  data:
 *                                      type: array
 *                                      items:
 *                                          type: object
 *              500:
 *                  description: Server error
*/
router.get("/getAllUsersRegisteredData", async (req, res, next) => {
    try{   
        const users = await User.find({})
        .select("firstName middleName lastName email gender dateOfBirth userName");
        const data = users.map(user => ({
            id: user.id,
            full_name: `${user.firstName} ${user.middleName} ${user.lastName}`,
            age: calculateAge(user.dateOfBirth),
            gender: user.gender,
            email: user.email,
            user_name: user.userName
        }));
        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    }catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve a specific user by integer ID
 *     description: >
 *       Fetch a single registered user using the auto-incremented integer `id` (counter-based).
 *       This is different from MongoDB's internal `_id` (ObjectId). Useful for fetching
 *       users by sequential numeric IDs like 1, 2, 3, etc.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The auto-incremented integer ID of the user
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     full_name:
 *                       type: string
 *                       example: "Youssef Khodor El-Chehimi"
 *                     age:
 *                       type: integer
 *                       example: 21
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: "2002-11-06"
 *                     gender:
 *                       type: string
 *                       enum: [male, female]
 *                       example: male
 *                     email:
 *                       type: string
 *                       example: "chehimi030@gmail.com"
 *                     user_name:
 *                       type: string
 *                       example: "youssef123"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User with ID 1 not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     tags:
 *       - Users
 *     summary: Search users by full name (first, middle, or last)
 *     description: >
 *       Search for users whose first, middle, or last name contains the query string.
 *       Returns all matched users with full details.
 *     parameters:
 *       - in: query
 *         name: full_name
 *         required: true
 *         description: Part of the user's full name to search
 *         schema:
 *           type: string
 *           example: Youssef
 *     responses:
 *       200:
 *         description: Successfully retrieved matched users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       full_name:
 *                         type: string
 *                         example: "Youssef Khodor El-Chehimi"
 *                       age:
 *                         type: integer
 *                         example: 21
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                         example: "2002-11-06"
 *                       gender:
 *                         type: string
 *                         enum: [male, female]
 *                         example: male
 *                       email:
 *                         type: string
 *                         example: "chehimi030@gmail.com"
 *                       user_name:
 *                         type: string
 *                         example: "youssef123"
 */
router.get("/search", async (req, res, next) => {
    try {
        const { full_name } = req.query;

        if (!full_name || full_name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please provide a full_name query parameter."
            });
        }

        const nameParts = full_name.trim().split(" ");

        // ✅ Correct MongoDB regex query
        const searchQuery = {
            $or: nameParts.flatMap(part => [
                { firstName:  { $regex: part, $options: "i" } },
                { middleName: { $regex: part, $options: "i" } },
                { lastName:   { $regex: part, $options: "i" } }
            ])
        };

        const users = await User.find(searchQuery)
            .select("firstName middleName lastName dateOfBirth gender email userName");

        const data = users.map(user => ({
            id:            user.id,
            full_name:     `${user.firstName} ${user.middleName} ${user.lastName}`,
            age:           calculateAge(user.dateOfBirth),
            date_of_birth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null,
            gender:        user.gender,
            email:         user.email,
            user_name:     user.userName
        }));

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        next(err); // ✅ Let global error handler deal with it
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id); // Convert path param to integer
        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${userId} not found`
            });
        }

        const full_name = `${user.firstName} ${user.middleName} ${user.lastName}`;
        const age = calculateAge(user.dateOfBirth);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                full_name,
                age,
                date_of_birth: user.dateOfBirth,
                gender: user.gender,
                email: user.email,
                user_name: user.userName
            }
        });
    } catch (err) {
        next(err);
    }
});


/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a specific user by integer ID
 *     description: >
 *       Deletes a registered user using the auto-incremented integer `id` (counter-based).
 *       This is different from MongoDB's internal `_id` (ObjectId). Useful for deleting
 *       users by sequential numeric IDs like 1, 2, 3, etc.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The auto-incremented integer ID of the user to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully deleted the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User with ID 1 has been deleted successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User with ID 1 not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.delete("/:id", async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id); // Convert path param to integer

        // Attempt to delete user by counter id
        const deletedUser = await User.findOneAndDelete({ id: userId });

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${userId} not found`
            });
        }

        res.status(200).json({
            success: true,
            message: `User with ID ${userId} has been deleted successfully`
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update a specific user by integer ID
 *     description: >
 *       Updates the fields of a registered user using the auto-incremented integer `id` (counter-based).
 *       Returns the previous data and the updated data after saving.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The auto-incremented integer ID of the user to update
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update (any subset of user fields)
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Youssef
 *               middle_name:
 *                 type: string
 *                 example: Khodor
 *               last_name:
 *                 type: string
 *                 example: El-Chehimi
 *               email:
 *                 type: string
 *                 example: chehimi030@gmail.com
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "2002-11-06"
 *               user_name:
 *                 type: string
 *                 example: youssef123
 *     responses:
 *       200:
 *         description: Successfully updated the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 old_data:
 *                   type: object
 *                 updated_data:
 *                   type: object
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User with ID 1 not found"
 *       500:
 *         description: Internal server error
 */
router.put("/:id", async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id); // Convert path param to integer

        // Find the user by counter ID
        const user = await User.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${userId} not found`
            });
        }

        // Save old data to return
        const old_data = {
            id: user.id,
            first_name: user.firstName,
            middle_name: user.middleName,
            last_name: user.lastName,
            email: user.email,
            gender: user.gender,
            date_of_birth: user.dateOfBirth,
            user_name: user.userName
        };

        // Update fields only if provided
        const {
            first_name,
            middle_name,
            last_name,
            email,
            gender,
            date_of_birth,
            user_name
        } = req.body;

        if (first_name !== undefined) user.firstName = first_name;
        if (middle_name !== undefined) user.middleName = middle_name;
        if (last_name !== undefined) user.lastName = last_name;
        if (email !== undefined) user.email = email;
        if (gender !== undefined) user.gender = gender;
        if (date_of_birth !== undefined) user.dateOfBirth = date_of_birth;
        if (user_name !== undefined) user.userName = user_name;

        // Save updated user
        await user.save();

        // Prepare updated data
        const updated_data = {
            id: user.id, // Include the same ID
            first_name: user.firstName,
            middle_name: user.middleName,
            last_name: user.lastName,
            email: user.email,
            gender: user.gender,
            date_of_birth: user.dateOfBirth,
            user_name: user.userName
        };

        // Send response with old and new data
        res.status(200).json({
            success: true,
            old_data,
            updated_data
        });

    } catch (err) {
        // Handle duplicate fields like email or username
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `Duplicate value for field: ${field}`
            });
        }

        next(err);
    }
});




/* 
Api's that we need to work on it by users is :
✔ POST /users → create

✔ GET /users → list

✔ GET /users/:id → show

✔ PUT /users/:id → update

✔ DELETE /users/:id → delete

✔ Validation working

✔ Error handling working

✔ Swagger docs updated
*/

module.exports = router;
