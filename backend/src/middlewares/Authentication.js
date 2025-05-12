const httpStatus = require("http-status")
const ApiError = require("../utils/ApiError")
const { validateToken } = require("../utils/Token.utils")

const Authentication = (req, res, next) => {
    try {
        const headers = req.headers['authorization'] || ''

        if (!headers || !headers.startsWith("Bearer ")) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Please Login first")
        }
        console.log(" Da tai day 2 ")
        const auth_token = headers.split(" ")[1]

        if (!auth_token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Please Provide valid")
        }
        console.log(" Da tai day 3 ")
        const data = validateToken(auth_token)
        req.user = data.userid
        console.log(" Da tai day 1 ")
        next()

    } catch (error) {
        next(error)
    }
}

module.exports = Authentication