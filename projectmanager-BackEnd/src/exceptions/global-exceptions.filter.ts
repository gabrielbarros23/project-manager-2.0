import { ArgumentsHost, Catch, HttpException, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

import { Response } from 'express'
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/client";


//filtro global usado em todos os request que não tem uma exception setada
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>();

    if (exception instanceof PrismaClientKnownRequestError) {
      response.status(400).json({
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        code:exception.code,
        message: exception.message
      })
      super.catch(exception, host)
      return
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : (exception as any)?.message || "Internal server Error"

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      message: message
    })

    super.catch(exception, host)

  }
}
