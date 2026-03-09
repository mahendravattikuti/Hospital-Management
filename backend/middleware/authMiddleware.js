const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {

 const token = req.headers.authorization

 if (!token) {
   return res.status(401).json("Unauthorized")
 }

 try {

   const decoded = jwt.verify(token, process.env.JWT_SECRET)

   req.user = decoded

   next()

 } catch (error) {

   return res.status(403).json("Invalid token")

 }

}

module.exports = authMiddleware