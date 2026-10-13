
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";



const verifyToken = (token: string, secret: string) => {

    try {

        const decoded = jwt.verify(token, secret) as JwtPayload;

        return {
            success: true,
            data: decoded
        }


        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {

        return {
            success: false,
            message: error.message,
            error
        }

    }
}

const decodeToken = (token: string) => {

    const decoded = jwt.decode(token) as JwtPayload

    return decoded
}


export const jwtUtils = {
    verifyToken,
    decodeToken
}