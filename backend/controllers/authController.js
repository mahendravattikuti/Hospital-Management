const pool = require("../../backend/backend/db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req, res) => {

 const { email, password } = req.body

 const user = await pool.query(
   "SELECT * FROM users WHERE email=$1",
   [email]
 )

 if (user.rows.length === 0) {
   return res.status(404).json("User not found")
 }

 const valid = await bcrypt.compare(password, user.rows[0].password)

 if (!valid) {
   return res.status(401).json("Invalid password")
 }

 const token = jwt.sign(
   { id: user.rows[0].id, role: user.rows[0].role },
   process.env.JWT_SECRET,
   { expiresIn: "1d" }
 )

 res.json({
   token,
   user: user.rows[0]
 })
}