const db = require("../db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.login = async (req, res) => {

 const { email, password } = req.body

 db.get(
   "SELECT * FROM users WHERE email = ?",
   [email],
   async (err, user) => {
     if (err) {
       return res.status(500).json({ message: err.message })
     }
     
     if (!user) {
       return res.status(401).json({ message: "Invalid email or password" })
     }

     const valid = await bcrypt.compare(password, user.password)

     if (!valid) {
       return res.status(401).json({ message: "Invalid email or password" })
     }

     const token = jwt.sign(
       { id: user.id, role: user.role },
       process.env.JWT_SECRET || "hospital_secret",
       { expiresIn: "1d" }
     )

     res.json({
       token,
       user: user
     })
   }
 )
}