import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * 错误响应异常
 * @param code 状态码（可选）
 * @param message 错误信息
 */
export class ApiException extends HttpException {

    private errorCode: number

    constructor(code: number, message: string)
    constructor(message: string)
    constructor(codeOrMessage: number | string, message?: string) {
        // 如果只传入一个参数，则第一个参数是 message
        if (message === undefined) {
            const msg = codeOrMessage as string
            super(HttpException.createBody({
                code: 500,
                message: msg,
            }),
                HttpStatus.INTERNAL_SERVER_ERROR)
            this.errorCode = 500
        } else {
            // 如果传入两个参数，则第一个是 code，第二个是 message
            const code = codeOrMessage as number
            super(HttpException.createBody({
                code: code,
                message: message,
            }),
                HttpStatus.OK)
            this.errorCode = Number(code)
        }
    }

    getErrorCode(): number {
        return this.errorCode
    }
}